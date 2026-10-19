using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Services;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Services;
using FluentAssertions;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Services;

public class HybridTenancyRoutingTests : IDisposable
{
    private readonly ApplicationDbContext dbContext;
    private readonly Mock<ISecretEncryptionService> encryptionServiceMock = new();
    private readonly Mock<IConfiguration> configurationMock = new();
    private readonly Mock<IHostEnvironment> hostEnvironmentMock = new();
    private readonly IMemoryCache memoryCache = new MemoryCache(new MemoryCacheOptions());
    private const string sharedConnectionString = "Host=shared-pg;Database=erpez_operational;Username=postgres;Password=shared";

    public HybridTenancyRoutingTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        dbContext = new ApplicationDbContext(options);

        configurationMock.Setup(c => c.GetSection("ConnectionStrings")["OperationalConnection"])
            .Returns(sharedConnectionString);
        configurationMock.Setup(c => c.GetSection("ConnectionStrings")["DefaultConnection"])
            .Returns(sharedConnectionString);

        hostEnvironmentMock.Setup(e => e.EnvironmentName).Returns("Production");
    }

    public void Dispose()
    {
        dbContext.Database.EnsureDeleted();
        dbContext.Dispose();
        memoryCache.Dispose();
    }

    [Fact]
    public async Task TenantConnectionResolver_WhenTenancyModeIsSaaS_ReturnsSharedOperationalConnection()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "SaaS Org",
            TenancyMode = TenancyMode.SaaS,
            ProvisioningState = TenantProvisioningState.Ready
        });
        await dbContext.SaveChangesAsync();

        var resolver = new TenantConnectionResolver(
            dbContext,
            encryptionServiceMock.Object,
            configurationMock.Object,
            hostEnvironmentMock.Object);

        // Act
        var result = await resolver.ResolveConnectionInfoAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.ConnectionString.Should().Be(sharedConnectionString);
        // Invariant: Encryption service should NOT be called for SaaS tenants
        encryptionServiceMock.Verify(e => e.Decrypt(It.IsAny<string>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task TenantConnectionResolver_WhenTenancyModeIsOnPremise_ResolvesAndDecryptsDedicatedConnection()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        const string dedicatedPlainConnStr = "Host=onprem-pg;Database=erpez_tenant_dedicated;Username=postgres;Password=secret";
        const string encryptedConnStr = "ENC:abc123xyz";

        dbContext.Tenants!.Add(new Tenant
        {
            Id = tenantId,
            Name = "OnPrem Corp",
            TenancyMode = TenancyMode.OnPremise,
            ProvisioningState = TenantProvisioningState.Ready
        });

        dbContext.TenantOperationalDatabases!.Add(new TenantOperationalDatabase
        {
            TenantId = tenantId,
            DatabaseName = "erpez_tenant_dedicated",
            EncryptedConnectionString = encryptedConnStr,
            EncryptionKeyVersion = 1,
            ProvisioningState = TenantProvisioningState.Ready
        });
        await dbContext.SaveChangesAsync();

        encryptionServiceMock.Setup(e => e.Decrypt(encryptedConnStr, 1))
            .Returns(dedicatedPlainConnStr);

        var resolver = new TenantConnectionResolver(
            dbContext,
            encryptionServiceMock.Object,
            configurationMock.Object,
            hostEnvironmentMock.Object);

        // Act
        var result = await resolver.ResolveConnectionInfoAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.ConnectionString.Should().Be(dedicatedPlainConnStr);
        encryptionServiceMock.Verify(e => e.Decrypt(encryptedConnStr, 1), Times.Once);
    }

    [Fact]
    public async Task CachedTenantConnectionResolver_WhenSaaS_ReturnsSharedConnectionWithoutCachingTenantEntry()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cachedResolver = new CachedTenantConnectionResolver(
            configurationMock.Object,
            encryptionServiceMock.Object,
            memoryCache,
            hostEnvironmentMock.Object);

        // Act
        var result = await cachedResolver.ResolveConnectionInfoAsync(tenantId, TenancyMode.SaaS);

        // Assert
        result.Should().NotBeNull();
        result!.ConnectionString.Should().Be(sharedConnectionString);

        // Invariant: SaaS connections must not pollute the tenant cache
        memoryCache.TryGetValue($"tenant:conn:{tenantId}", out var _).Should().BeFalse();
    }

    [Fact]
    public void CachedTenantConnectionResolver_InvalidateConnection_RemovesCachedEntry()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var cacheKey = $"tenant:conn:{tenantId}";
        memoryCache.Set(cacheKey, new TenantDatabaseConnectionInfo(tenantId, "Host=cached;Database=test"));

        var cachedResolver = new CachedTenantConnectionResolver(
            configurationMock.Object,
            encryptionServiceMock.Object,
            memoryCache,
            hostEnvironmentMock.Object);

        // Act
        cachedResolver.InvalidateConnection(tenantId);

        // Assert
        memoryCache.TryGetValue(cacheKey, out var _).Should().BeFalse();
    }

    [Fact]
    public async Task CreateTenantCommandHandler_WhenSaaS_SetsTenancyModeSaaS_AndDoesNotEnqueueProvisioner()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var tenantRepoMock = new Mock<ITenantRepository>();
        var roleRepoMock = new Mock<IRoleRepository>();
        var moduleRepoMock = new Mock<IModuleRepository>();
        var backgroundJobClientMock = new Mock<IBackgroundJobClient>();
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.Setup(u => u.UserId).Returns("user-1");

        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.RoleRepository).Returns(roleRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ModuleRepository).Returns(moduleRepoMock.Object);

        Tenant? capturedTenant = null;
        tenantRepoMock.Setup(u => u.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .Callback<Tenant, CancellationToken>((t, _) => capturedTenant = t)
            .Returns(() => Task.CompletedTask);

        roleRepoMock.Setup(u => u.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Role, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = Guid.NewGuid(), Name = "Tenant Administrator", NormalizedName = "TENANT ADMINISTRATOR" });

        var handler = new CreateTenantCommandHandler(
            unitOfWorkMock.Object,
            currentUserServiceMock.Object,
            backgroundJobClientMock.Object);

        var command = new CreateTenantCommand
        {
            Name = "SaaS Company",
            BillingContactEmail = "billing@saas.com",
            OnPremise = false // SaaS mode
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedTenant.Should().NotBeNull();
        capturedTenant!.TenancyMode.Should().Be(TenancyMode.SaaS);
        capturedTenant.ProvisioningState.Should().Be(TenantProvisioningState.Ready);
        capturedTenant.OperationalDatabase.Should().BeNull();

        // Invariant: No physical Hangfire DB provisioner job is enqueued for SaaS
        backgroundJobClientMock.Verify(b => b.Create(
            It.IsAny<Hangfire.Common.Job>(),
            It.IsAny<Hangfire.States.IState>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateTenantCommandHandler_WhenOnPremise_SetsTenancyModeOnPremise_AndEnqueuesProvisioner()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var tenantRepoMock = new Mock<ITenantRepository>();
        var roleRepoMock = new Mock<IRoleRepository>();
        var moduleRepoMock = new Mock<IModuleRepository>();
        var backgroundJobClientMock = new Mock<IBackgroundJobClient>();
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        currentUserServiceMock.Setup(u => u.UserId).Returns("user-1");

        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.RoleRepository).Returns(roleRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ModuleRepository).Returns(moduleRepoMock.Object);

        Tenant? capturedTenant = null;
        tenantRepoMock.Setup(u => u.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .Callback<Tenant, CancellationToken>((t, _) => capturedTenant = t)
            .Returns(() => Task.CompletedTask);

        roleRepoMock.Setup(u => u.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Role, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Role { Id = Guid.NewGuid(), Name = "Tenant Administrator", NormalizedName = "TENANT ADMINISTRATOR" });

        var handler = new CreateTenantCommandHandler(
            unitOfWorkMock.Object,
            currentUserServiceMock.Object,
            backgroundJobClientMock.Object);

        var command = new CreateTenantCommand
        {
            Name = "Sovereign Agency",
            BillingContactEmail = "admin@agency.gov",
            OnPremise = true // OnPremise mode
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedTenant.Should().NotBeNull();
        capturedTenant!.TenancyMode.Should().Be(TenancyMode.OnPremise);
        capturedTenant.ProvisioningState.Should().Be(TenantProvisioningState.Pending);
        capturedTenant.OperationalDatabase.Should().NotBeNull();

        // Invariant: Hangfire DB provisioner job MUST be enqueued for On-Premise dedicated DB
        backgroundJobClientMock.Verify(b => b.Create(
            It.IsAny<Hangfire.Common.Job>(),
            It.IsAny<Hangfire.States.IState>()),
            Times.Once);
    }
}
