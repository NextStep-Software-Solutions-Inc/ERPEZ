using System.Security.Claims;
using ERPEZ.Shared.Enums;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Services;

public class TenantAccessServiceTests : IDisposable
{
    private readonly ApplicationDbContext dbContext;
    private readonly Mock<ILicenseService> licenseServiceMock = new();
    private readonly TenantAccessService accessService;

    public TenantAccessServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);
        accessService = new TenantAccessService(dbContext, licenseServiceMock.Object);
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
    }

    private static ClaimsPrincipal CreateUser(string? sub, bool isAuthenticated = true)
    {
        if (!isAuthenticated || string.IsNullOrWhiteSpace(sub))
        {
            return new ClaimsPrincipal(new ClaimsIdentity());
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, sub),
            new("sub", sub)
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ClaimsPrincipal(identity);
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenUserUnauthenticated_Returns401AuthRequired()
    {
        // Arrange
        var user = CreateUser(null, isAuthenticated: false);
        var tenantId = Guid.NewGuid();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(401);
        result.ErrorCode.Should().Be("AUTH_REQUIRED");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenUserMissingSubClaim_Returns401AuthRequired()
    {
        // Arrange
        var identity = new ClaimsIdentity(new List<Claim>(), "TestAuth"); // Authenticated but empty claims
        var user = new ClaimsPrincipal(identity);
        var tenantId = Guid.NewGuid();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(401);
        result.ErrorCode.Should().Be("AUTH_REQUIRED");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenCallerNotMember_Returns403MembershipRequired()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-outsider");

        // Seed tenant
        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            ProvisioningState = TenantProvisioningState.Ready
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(403);
        result.ErrorCode.Should().Be("TENANT_MEMBERSHIP_REQUIRED");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenTenantNotFound_Returns404TenantNotFound()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        // Seed member for tenantId, but no tenant entity
        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(404);
        result.ErrorCode.Should().Be("TENANT_NOT_FOUND");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenTenantDisabled_Returns403TenantDisabled()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Disabled Corp",
            IsDisabled = true,
            ProvisioningState = TenantProvisioningState.Ready
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(403);
        result.ErrorCode.Should().Be("TENANT_DISABLED");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenTenantProvisioning_Returns503TenantProvisioning()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Provisioning Corp",
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Provisioning
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(503);
        result.ErrorCode.Should().Be("TENANT_PROVISIONING");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenDomainViolation_Returns403DomainViolation()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready,
            TenantSetting = new TenantSetting
            {
                TenantId = tenantId,
                AllowedDomain = "acme.erpez.com"
            }
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });
        await dbContext.SaveChangesAsync();

        // Act: request comes from unauthorized domain
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "evil-phishing.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(403);
        result.ErrorCode.Should().Be("DOMAIN_VIOLATION");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenLicenseExpired_Returns403LicenseExpired()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });

        var license = new LicenseKey
        {
            TenantId = tenantId,
            Key = "TEST-KEY-EXPIRED",
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            Status = LicenseStatus.Expired
        };
        dbContext.LicenseKeys!.Add(license);
        await dbContext.SaveChangesAsync();

        licenseServiceMock.Setup(l => l.ValidateLicense(It.IsAny<LicenseKey>(), It.IsAny<string>()))
            .Returns(new LicenseValidationResult(
                IsValid: false,
                ErrorMessage: "Tenant license is expired or invalid.",
                LicenseKey: license,
                IsDomainMatched: true,
                IsExpired: true,
                RemainingDays: 0));

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "app.erpez.com");

        // Assert
        result.IsAllowed.Should().BeFalse();
        result.HttpStatusCode.Should().Be(403);
        result.ErrorCode.Should().Be("LICENSE_EXPIRED");
    }

    [Fact]
    public async Task EvaluateAccessAsync_WhenAllInvariantsSatisfied_ReturnsSuccessWithSafeAccessContext()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var user = CreateUser("user-member");

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            IsDisabled = false,
            ProvisioningState = TenantProvisioningState.Ready,
            TenantSetting = new TenantSetting
            {
                TenantId = tenantId,
                AllowedDomain = "*.erpez.com"
            }
        });

        dbContext.TenantMembers!.Add(new TenantMember
        {
            TenantId = tenantId,
            ExternalIdentityId = "user-member",
            Status = Status.Active,
            IsDeleted = false
        });
        await dbContext.SaveChangesAsync();

        // Act
        var result = await accessService.EvaluateAccessAsync(user, tenantId, "customer1.erpez.com");

        // Assert
        result.IsAllowed.Should().BeTrue();
        result.Context.Should().NotBeNull();
        result.Context!.TenantId.Should().Be(tenantId);
        result.Context.TenantName.Should().Be("Acme Corp");
        result.Context.ProvisioningState.Should().Be(TenantProvisioningState.Ready);
        result.Context.AllowedDomain.Should().Be("*.erpez.com");
    }
}
