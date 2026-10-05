using System.Linq.Expressions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ClaimTrialLicense;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Licenses.Commands.ClaimTrialLicense;

public class ClaimTrialLicenseCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock = new();
    private readonly Mock<ITenantRepository> tenantRepoMock = new();
    private readonly Mock<ILicenseKeyRepository> licenseRepoMock = new();
    private readonly Mock<ITenantSubscriptionRepository> subRepoMock = new();
    private readonly Mock<ITenantSettingRepository> settingRepoMock = new();
    private readonly Mock<ILicenseService> licenseServiceMock = new();
    private readonly Mock<ICurrentUserService> currentUserServiceMock = new();

    private readonly ClaimTrialLicenseCommandHandler handler;

    public ClaimTrialLicenseCommandHandlerTests()
    {
        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LicenseKeyRepository).Returns(licenseRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSubscriptionRepository).Returns(subRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSettingRepository).Returns(settingRepoMock.Object);

        currentUserServiceMock.Setup(u => u.UserId).Returns("user_123");
        currentUserServiceMock.Setup(u => u.Email).Returns("admin@acme.com");

        handler = new ClaimTrialLicenseCommandHandler(
            unitOfWorkMock.Object,
            licenseServiceMock.Object,
            currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_WhenTenantNotFound_ReturnsFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        var command = new ClaimTrialLicenseCommand { TenantId = tenantId };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Target tenant not found");
    }

    [Fact]
    public async Task Handle_WhenActiveTrialLicenseAlreadyExists_ReturnsExistingLicense()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            TenantSetting = new TenantSetting { BillingContactEmail = "billing@acme.com", AllowedDomain = "localhost" }
        };

        var existingLicense = new LicenseKey
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Key = "TRIAL-STD-20261029-ABCD-1234",
            Prefix = "TRIAL",
            Plan = Plan.Starter,
            Status = LicenseStatus.Active,
            ExpiresAt = DateTime.UtcNow.AddDays(25),
            BoundEmail = "billing@acme.com",
            AllowedDomain = "localhost",
            Notes = "30-Day Full System Access Free Trial"
        };

        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        licenseRepoMock.Setup(r => r.GetActiveByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingLicense);

        var command = new ClaimTrialLicenseCommand { TenantId = tenantId };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Key.Should().Be(existingLicense.Key);
        result.Data.RemainingDays.Should().BeGreaterThan(0);
        result.Message.Should().Contain("Active 30-day trial license already provisioned");
    }

    [Fact]
    public async Task Handle_WhenNoActiveLicense_ProvisionsNew30DayTrialLicense()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Beta Corp",
            TenantSetting = new TenantSetting { BillingContactEmail = "billing@beta.com", AllowedDomain = "beta.local" }
        };

        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);
        licenseRepoMock.Setup(r => r.GetActiveByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((LicenseKey?)null);

        licenseServiceMock.Setup(l => l.GenerateKeyString("TRIAL", It.IsAny<string>(), It.IsAny<DateTime>(), Plan.Starter))
            .Returns("TRIAL-STD-20261029-BETA-5678");
        licenseServiceMock.Setup(l => l.ComputeSignature(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .Returns("HMAC_SIG_12345");

        subRepoMock.Setup(s => s.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var command = new ClaimTrialLicenseCommand { TenantId = tenantId, AllowedDomain = "beta.local" };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Key.Should().Be("TRIAL-STD-20261029-BETA-5678");
        result.Data.RemainingDays.Should().Be(30);
        result.Data.Status.Should().Be("Active");
        result.Data.Plan.Should().Be("Starter");

        licenseRepoMock.Verify(r => r.AddAsync(It.Is<LicenseKey>(lk => lk.Prefix == "TRIAL" && lk.Plan == Plan.Starter), It.IsAny<CancellationToken>()), Times.Once);
        subRepoMock.Verify(s => s.AddAsync(It.Is<TenantSubscription>(ts => ts.Plan == Plan.Starter && ts.Amount == 0m), It.IsAny<CancellationToken>()), Times.Once);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
