using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ActivateLicense;
using ERPEZ.TenantManagement.Application.Features.Licenses.Queries.ValidateLicense;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Licenses;

public class LicenseValidationAndActivationTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock = new();
    private readonly Mock<ILicenseKeyRepository> licenseRepoMock = new();
    private readonly Mock<ITenantRepository> tenantRepoMock = new();
    private readonly Mock<ITenantSubscriptionRepository> subRepoMock = new();
    private readonly Mock<ITenantSettingRepository> settingRepoMock = new();
    private readonly Mock<ILicenseService> licenseServiceMock = new();

    public LicenseValidationAndActivationTests()
    {
        unitOfWorkMock.Setup(u => u.LicenseKeyRepository).Returns(licenseRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSubscriptionRepository).Returns(subRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSettingRepository).Returns(settingRepoMock.Object);
    }

    [Fact]
    public async Task ValidateLicense_WhenNotFound_ReturnsInvalidResponse()
    {
        // Arrange
        licenseRepoMock.Setup(r => r.GetByKeyAsync("UNKNOWN-KEY", It.IsAny<CancellationToken>()))
            .ReturnsAsync((LicenseKey?)null);

        var handler = new ValidateLicenseQueryHandler(unitOfWorkMock.Object, licenseServiceMock.Object);
        var query = new ValidateLicenseQuery("UNKNOWN-KEY", "localhost");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.IsValid.Should().BeFalse();
        result.Data.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task ValidateLicense_WhenValid_ReturnsValidResponseWithDetails()
    {
        // Arrange
        var license = new LicenseKey
        {
            Id = Guid.NewGuid(),
            Key = "EPZ-ONPREM-20270101-ABCD-1234",
            Prefix = "EPZ-ONPREM",
            Plan = Plan.OnPremise,
            AllowedDomain = "localhost",
            BoundEmail = "admin@acme.com",
            ExpiresAt = DateTime.UtcNow.AddDays(365),
            Status = LicenseStatus.Active
        };

        licenseRepoMock.Setup(r => r.GetByKeyAsync(license.Key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(license);

        licenseServiceMock.Setup(s => s.ValidateLicense(license, "localhost"))
            .Returns(new LicenseValidationResult(
                IsValid: true,
                ErrorMessage: null,
                LicenseKey: license,
                IsDomainMatched: true,
                IsExpired: false,
                RemainingDays: 365));

        var handler = new ValidateLicenseQueryHandler(unitOfWorkMock.Object, licenseServiceMock.Object);
        var query = new ValidateLicenseQuery(license.Key, "localhost");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.IsValid.Should().BeTrue();
        result.Data.RemainingDays.Should().Be(365);
        result.Data.IsDomainMatched.Should().BeTrue();
        result.Data.License.Should().NotBeNull();
        result.Data.License!.Key.Should().Be(license.Key);
    }

    [Fact]
    public async Task ActivateLicense_WhenValid_ActivatesAndBindsToTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            TenantSetting = new TenantSetting { AllowedDomain = "localhost" }
        };

        var license = new LicenseKey
        {
            Id = Guid.NewGuid(),
            Key = "EPZ-PRO-20270101-ABCD-5678",
            Plan = Plan.Professional,
            AllowedDomain = "app.acme.com",
            ExpiresAt = DateTime.UtcNow.AddDays(180),
            Status = LicenseStatus.Active
        };

        licenseRepoMock.Setup(r => r.GetByKeyAsync(license.Key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(license);
        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        licenseServiceMock.Setup(s => s.ValidateLicense(license, "app.acme.com"))
            .Returns(new LicenseValidationResult(
                IsValid: true,
                ErrorMessage: null,
                LicenseKey: license,
                IsDomainMatched: true,
                IsExpired: false,
                RemainingDays: 180));

        var handler = new ActivateLicenseCommandHandler(unitOfWorkMock.Object, licenseServiceMock.Object);
        var command = new ActivateLicenseCommand
        {
            Key = license.Key,
            TenantId = tenantId,
            CurrentDomain = "app.acme.com"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.TenantId.Should().Be(tenantId);
        result.Data.Status.Should().Be("Active");
        license.TenantId.Should().Be(tenantId);
        license.ActivatedAt.Should().NotBeNull();
        tenant.TenantSetting.AllowedDomain.Should().Be(license.AllowedDomain);
        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
