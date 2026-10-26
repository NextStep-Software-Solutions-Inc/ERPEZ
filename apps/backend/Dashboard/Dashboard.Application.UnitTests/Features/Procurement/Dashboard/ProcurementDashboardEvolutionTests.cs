using System;
using System.Threading;
using System.Threading.Tasks;
using Dashboard.Application.UnitTests.Features.Procurement.Contracts;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetBudgetBurnAnalytics;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetProcurementAuditTrail;
using ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetSupplierPerformanceDetail;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Dashboard;

public class ProcurementDashboardEvolutionTests
{
    [Fact]
    public async Task GetProcurementAuditTrail_ShouldReturnEmptyList_WhenDatabaseIsEmpty()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var handler = new GetProcurementAuditTrailQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetProcurementAuditTrailQuery(20), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().BeEmpty();
    }

    [Fact]
    public async Task GetProcurementAuditTrail_ShouldReturnLogs_WhenAuditEventsExist()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-2026-TEST-0001",
            SupplierId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };
        context.NoticeOfAwards?.Add(noa);
        await context.SaveChangesAsync();

        var handler = new GetProcurementAuditTrailQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetProcurementAuditTrailQuery(20), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data![0].DocumentNumber.Should().Be("NOA-2026-TEST-0001");
        result.Data[0].Action.Should().Be("Approved & Issued NOA");
    }

    [Fact]
    public async Task GetSupplierPerformanceDetail_ShouldReturnFail_WhenSupplierNotFound()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var handler = new GetSupplierPerformanceDetailQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierPerformanceDetailQuery(Guid.NewGuid()), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Fact]
    public async Task GetSupplierPerformanceDetail_ShouldReturnPerformance_WhenSupplierExists()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Apex Technology Solutions Inc.",
            BusinessPermitNo = "BP-2026-0042",
            PhilGEPSNumber = "PHILGEPS-PLATINUM-8888",
            Status = "Approved",
            IsBlocked = false
        };
        context.Suppliers?.Add(supplier);
        await context.SaveChangesAsync();

        var handler = new GetSupplierPerformanceDetailQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierPerformanceDetailQuery(supplier.Id), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.SupplierName.Should().Be("Apex Technology Solutions Inc.");
        result.Data.IsGppbBlacklisted.Should().BeFalse();
        result.Data.OnTimeDeliveryRate.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetBudgetBurnAnalytics_ShouldReturnBudgetBurnCalculations()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var handler = new GetBudgetBurnAnalyticsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetBudgetBurnAnalyticsQuery { FiscalYear = 2026 }, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.UnencumberedBalance.Should().BeGreaterOrEqualTo(0);
    }
}
