using System.Linq.Expressions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Commands.PurchaseLicense;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Licenses.Commands.PurchaseLicense;

public class PurchaseLicenseCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> unitOfWorkMock = new();
    private readonly Mock<ITenantRepository> tenantRepoMock = new();
    private readonly Mock<ILicenseKeyRepository> licenseRepoMock = new();
    private readonly Mock<ITenantSubscriptionRepository> subRepoMock = new();
    private readonly Mock<ITenantSettingRepository> settingRepoMock = new();
    private readonly Mock<ITenantInvoiceRepository> invoiceRepoMock = new();
    private readonly Mock<ITenantPaymentMethodRepository> paymentMethodRepoMock = new();
    private readonly Mock<IModuleRepository> moduleRepoMock = new();
    private readonly Mock<ILicenseService> licenseServiceMock = new();
    private readonly Mock<ICurrentUserService> currentUserServiceMock = new();

    private readonly PurchaseLicenseCommandHandler handler;

    public PurchaseLicenseCommandHandlerTests()
    {
        unitOfWorkMock.Setup(u => u.TenantRepository).Returns(tenantRepoMock.Object);
        unitOfWorkMock.Setup(u => u.LicenseKeyRepository).Returns(licenseRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSubscriptionRepository).Returns(subRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantSettingRepository).Returns(settingRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantInvoiceRepository).Returns(invoiceRepoMock.Object);
        unitOfWorkMock.Setup(u => u.TenantPaymentMethodRepository).Returns(paymentMethodRepoMock.Object);
        unitOfWorkMock.Setup(u => u.ModuleRepository).Returns(moduleRepoMock.Object);

        currentUserServiceMock.Setup(u => u.UserId).Returns("user_buyer");
        currentUserServiceMock.Setup(u => u.Email).Returns("admin@corp.com");

        handler = new PurchaseLicenseCommandHandler(
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

        var command = new PurchaseLicenseCommand
        {
            TenantId = tenantId,
            AllowedDomain = "localhost"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Target tenant not found");
    }

    [Fact]
    public async Task Handle_WhenOnPremiseProfessionalPurchased_CalculatesCorrectPriceAndMintsKey()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Acme Corp",
            TenantSetting = new TenantSetting { BillingContactEmail = "finance@acme.com", AllowedDomain = "localhost" }
        };

        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        licenseServiceMock.Setup(l => l.GenerateKeyString("EPZ-ONPREM", It.IsAny<string>(), It.IsAny<DateTime>(), Plan.Professional))
            .Returns("EPZ-ONPREM-PRO-20270929-ABCD-1234");
        licenseServiceMock.Setup(l => l.ComputeSignature(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .Returns("SIG_HEX_9876");

        subRepoMock.Setup(s => s.FindAsync(It.IsAny<Expression<Func<TenantSubscription, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var command = new PurchaseLicenseCommand
        {
            TenantId = tenantId,
            Plan = Plan.Professional,
            BillingCycle = BillingCycle.Yearly,
            IsAirGapped = true,
            AllowedDomain = "erp.acme.internal"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Key.Should().Be("EPZ-ONPREM-PRO-20270929-ABCD-1234");
        result.Data.Plan.Should().Be("Professional");
        result.Data.IsAirGapped.Should().BeTrue();
        result.Data.AllowedDomain.Should().Be("erp.acme.internal");
        result.Data.MaxUsers.Should().Be(100);
        result.Data.MaxTenants.Should().Be(3);

        // Verify invoice generated with On-Prem Professional price ($4,999)
        invoiceRepoMock.Verify(r => r.AddAsync(It.Is<TenantInvoice>(inv =>
            inv.TenantId == tenantId &&
            inv.SubtotalAmount == 4999m &&
            inv.TotalAmount == 5598.88m &&
            inv.Status == InvoiceStatus.Paid), It.IsAny<CancellationToken>()), Times.Once);

        // Verify subscription created with $4,999
        subRepoMock.Verify(r => r.AddAsync(It.Is<TenantSubscription>(sub =>
            sub.TenantId == tenantId &&
            sub.Plan == Plan.Professional &&
            sub.Amount == 4999m &&
            sub.Status == Status.Active), It.IsAny<CancellationToken>()), Times.Once);

        // Verify license key added
        licenseRepoMock.Verify(r => r.AddAsync(It.Is<LicenseKey>(lk =>
            lk.TenantId == tenantId &&
            lk.Prefix == "EPZ-ONPREM" &&
            lk.Plan == Plan.Professional &&
            lk.IsAirGapped == true), It.IsAny<CancellationToken>()), Times.Once);

        unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCloudSaaSStarterPurchased_CalculatesCorrectPriceAndMintsCloudKey()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Starter Corp",
            TenantSetting = new TenantSetting { BillingContactEmail = "starter@corp.com", AllowedDomain = "app.erpez.com" }
        };

        tenantRepoMock.Setup(r => r.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        licenseServiceMock.Setup(l => l.GenerateKeyString("EPZ-CLOUD", It.IsAny<string>(), It.IsAny<DateTime>(), Plan.Starter))
            .Returns("EPZ-CLOUD-STD-20261029-XYZ-9999");
        licenseServiceMock.Setup(l => l.ComputeSignature(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<DateTime>()))
            .Returns("SIG_HEX_CLOUD_111");

        var command = new PurchaseLicenseCommand
        {
            TenantId = tenantId,
            Plan = Plan.Starter,
            BillingCycle = BillingCycle.Monthly,
            IsAirGapped = false,
            AllowedDomain = "starter.erpez.com"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.Key.Should().Be("EPZ-CLOUD-STD-20261029-XYZ-9999");
        result.Data.Plan.Should().Be("Starter");
        result.Data.IsAirGapped.Should().BeFalse();
        result.Data.MaxUsers.Should().Be(15);
        result.Data.MaxTenants.Should().Be(1);

        // Verify invoice generated with Cloud SaaS Starter monthly price ($99)
        invoiceRepoMock.Verify(r => r.AddAsync(It.Is<TenantInvoice>(inv =>
            inv.TenantId == tenantId &&
            inv.SubtotalAmount == 99m &&
            inv.Status == InvoiceStatus.Paid), It.IsAny<CancellationToken>()), Times.Once);
    }
}
