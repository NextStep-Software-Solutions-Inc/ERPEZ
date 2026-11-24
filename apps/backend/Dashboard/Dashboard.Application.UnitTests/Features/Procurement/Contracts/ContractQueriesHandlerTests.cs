using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetAvailableNoasForContract;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractById;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContracts;
using ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractSummary;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.Contracts;

public class ContractQueriesHandlerTests
{
    [Fact]
    public async Task GetContracts_ShouldProjectSupplierProjectAndTotalAmountFromNoa()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var sieveProcessor = new SieveProcessor(new TestSieveOptionsAccessor());

        var (noa, supplier, project) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 1250000m);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-PROJ-01",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Normalized Projection Test",
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        context.Contracts?.Add(contract);
        await context.SaveChangesAsync();

        var query = new GetContractsQuery { PageNumber = 1, PageSize = 10 };
        var handler = new GetContractsQueryHandler(unitOfWork, sieveProcessor);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1);

        var dto = result.Data!.First();
        dto.Id.Should().Be(contract.Id);
        dto.ContractNumber.Should().Be("CONTRACT-2026-PROJ-01");
        dto.NOANumber.Should().Be(noa.NOANumber);
        // Normalization Invariants:
        dto.SupplierId.Should().Be(supplier.Id);
        dto.SupplierName.Should().Be("Acme Technologies Inc.");
        dto.ProcurementProjectId.Should().Be(project.Id);
        dto.ProjectTitle.Should().Be("IT Infrastructure & Server Upgrade");
        dto.TotalAmount.Should().Be(1250000m);
    }

    [Fact]
    public async Task GetContracts_WithStatusFilter_ShouldFilterCorrectly()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);
        var sieveProcessor = new SieveProcessor(new TestSieveOptionsAccessor());

        var (noa1, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);
        var (noa2, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context);

        var cDraft = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-DRAFT",
            NoticeOfAwardId = noa1.Id,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        var cApproved = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-APP",
            NoticeOfAwardId = noa2.Id,
            Status = ContractStatus.Approved,
            CreatedAt = DateTime.UtcNow
        };
        context.Contracts?.AddRange(cDraft, cApproved);
        await context.SaveChangesAsync();

        var query = new GetContractsQuery { Status = "Approved", PageNumber = 1, PageSize = 10 };
        var handler = new GetContractsQueryHandler(unitOfWork, sieveProcessor);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data!.First().ContractNumber.Should().Be("CONTRACT-APP");
    }

    [Fact]
    public async Task GetContractById_ShouldReturnFullDetailsWithLineItemsAndMilestones()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var (noa, supplier, project) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 750000m);

        var milestone = new NoticeOfAwardMilestone
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            MilestoneType = NoticeOfAwardMilestoneType.PerformanceSecurityPosted,
            DateLogged = new DateOnly(2026, 6, 18),
            Remarks = "Surety bond posted",
            LoggedByName = "BAC Officer",
            CreatedAt = DateTime.UtcNow
        };
        context.NoticeOfAwardMilestones?.Add(milestone);

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-2026-DETAIL",
            NoticeOfAwardId = noa.Id,
            ContractDate = new DateOnly(2026, 6, 20),
            Description = "Full Detail Contract",
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Staff Member"
        };
        context.Contracts?.Add(contract);
        await context.SaveChangesAsync();

        var query = new GetContractByIdQuery(contract.Id);
        var handler = new GetContractByIdQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var dto = result.Data;
        dto.Should().NotBeNull();
        dto!.Id.Should().Be(contract.Id);
        dto.ContractNumber.Should().Be("CONTRACT-2026-DETAIL");
        dto.SupplierName.Should().Be("Acme Technologies Inc.");
        dto.SupplierAddress.Should().Be("123 Technology Way, Cyber City");
        dto.ProjectTitle.Should().Be("IT Infrastructure & Server Upgrade");
        dto.TotalAmount.Should().Be(750000m);
        dto.LineItems.Should().NotBeEmpty();
        dto.Milestones.Should().HaveCount(1);
        dto.Milestones.First().MilestoneType.Should().Be(NoticeOfAwardMilestoneType.PerformanceSecurityPosted);
    }

    [Fact]
    public async Task GetContractSummary_ShouldComputeStatusCountsAndTotalFinancialValue()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        var (noa1, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 100000m);
        var (noa2, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 200000m);
        var (noa3, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 300000m);
        var (noa4, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, awardedAmount: 400000m);

        var c1 = new Contract { Id = Guid.NewGuid(), ContractNumber = "C1", NoticeOfAwardId = noa1.Id, Status = ContractStatus.Draft, CreatedAt = DateTime.UtcNow };
        var c2 = new Contract { Id = Guid.NewGuid(), ContractNumber = "C2", NoticeOfAwardId = noa2.Id, Status = ContractStatus.ForApproval, CreatedAt = DateTime.UtcNow };
        var c3 = new Contract { Id = Guid.NewGuid(), ContractNumber = "C3", NoticeOfAwardId = noa3.Id, Status = ContractStatus.Approved, CreatedAt = DateTime.UtcNow };
        var c4 = new Contract { Id = Guid.NewGuid(), ContractNumber = "C4", NoticeOfAwardId = noa4.Id, Status = ContractStatus.Cancelled, CreatedAt = DateTime.UtcNow };

        context.Contracts?.AddRange(c1, c2, c3, c4);
        await context.SaveChangesAsync();

        var query = new GetContractSummaryQuery();
        var handler = new GetContractSummaryQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var summary = result.Data;
        summary.Should().NotBeNull();
        summary!.Draft.Should().Be(1);
        summary.ForApproval.Should().Be(1);
        summary.Approved.Should().Be(1);
        summary.Executed.Should().Be(0);
        summary.Returned.Should().Be(0);
        summary.Cancelled.Should().Be(1);
        summary.Total.Should().Be(3); // Active total excludes Cancelled
        summary.TotalValue.Should().Be(600000m); // 100k + 200k + 300k (excludes cancelled 400k)
    }

    [Fact]
    public async Task GetAvailableNoasForContract_ShouldReturnApprovedNoasWithoutActiveContract()
    {
        // Arrange
        using var context = ContractTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = ContractTestHelpers.CreateUnitOfWork(context);

        // Seed 3 NOAs:
        // noa1 has an active draft contract -> should NOT be returned
        // noa2 has a cancelled contract -> SHOULD be returned
        // noa3 has no contract at all -> SHOULD be returned
        // noa4 is Draft NOA (not approved) -> should NOT be returned
        var (noa1, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);
        var (noa2, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);
        var (noa3, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Approved);
        var (noa4, _, _) = await ContractTestHelpers.SeedApprovedNoaAsync(context, NoticeOfAwardStatus.Draft);

        var activeContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-ACTIVE",
            NoticeOfAwardId = noa1.Id,
            Status = ContractStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        var cancelledContract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = "CONTRACT-CANCELLED",
            NoticeOfAwardId = noa2.Id,
            Status = ContractStatus.Cancelled,
            CreatedAt = DateTime.UtcNow
        };
        context.Contracts?.AddRange(activeContract, cancelledContract);
        await context.SaveChangesAsync();

        var query = new GetAvailableNoasForContractQuery();
        var handler = new GetAvailableNoasForContractQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        var availableIds = result.Data!.Select(a => a.Id).ToList();
        availableIds.Should().NotContain(noa1.Id); // Has active contract
        availableIds.Should().Contain(noa2.Id);    // Cancelled contract allows re-contracting
        availableIds.Should().Contain(noa3.Id);    // Uncontracted approved NOA
        availableIds.Should().NotContain(noa4.Id); // Draft NOA is not approved
    }
}
