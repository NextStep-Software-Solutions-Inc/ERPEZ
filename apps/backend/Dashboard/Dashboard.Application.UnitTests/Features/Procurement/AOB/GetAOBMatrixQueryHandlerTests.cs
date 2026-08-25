using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.AOB;

public class GetAOBMatrixQueryHandlerTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static IUnitOfWork CreateUnitOfWork(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<Microsoft.Extensions.Options.IOptions<Sieve.Models.SieveOptions>>(new SieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        return new UnitOfWork(context, serviceProvider);
    }

    [Fact]
    public async Task Handle_OverABC_ShouldFlagIsOverABC_AndDisqualifyFromRankOne()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var rfqItemId = Guid.NewGuid();
        var supplier1Id = Guid.NewGuid();
        var supplier2Id = Guid.NewGuid();
        var aobId = Guid.NewGuid();

        var supplier1 = new Supplier { Id = supplier1Id, Name = "Supplier Alpha", Email = "alpha@example.com" };
        var supplier2 = new Supplier { Id = supplier2Id, Name = "Supplier Beta", Email = "beta@example.com" };
        context.Suppliers?.AddRange(supplier1, supplier2);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-001",
            TracingNumber = "TR-001",
            Status = StatusEnum.Approved,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            RFQItems =
            [
                new RFQItem
                {
                    Id = rfqItemId,
                    RFQId = rfqId,
                    ItemNameSnapshot = "Laptop Computer",
                    UnitPriceSnapshot = 50000m, // ABC is 50,000
                    Quantity = 2
                }
            ]
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-001",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft,
            AOBDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OpeningDate = DateTime.UtcNow.AddHours(-1), // Already opened
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);

        // Supplier 1 bids 45,000 (Within ABC)
        var bid1 = new SupplierBid
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            SupplierId = supplier1Id,
            Status = "SUBMITTED",
            SupplierBidItems =
            [
                new SupplierBidItem
                {
                    RFQItemId = rfqItemId,
                    UnitPrice = 45000m,
                    TotalPrice = 90000m,
                    IsResponsive = true
                }
            ]
        };

        // Supplier 2 bids 55,000 (Over ABC)
        var bid2 = new SupplierBid
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            SupplierId = supplier2Id,
            Status = "SUBMITTED",
            SupplierBidItems =
            [
                new SupplierBidItem
                {
                    RFQItemId = rfqItemId,
                    UnitPrice = 55000m,
                    TotalPrice = 110000m,
                    IsResponsive = true
                }
            ]
        };

        context.SupplierBids?.AddRange(bid1, bid2);
        await context.SaveChangesAsync();

        var handler = new GetAOBMatrixQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetAOBMatrixQuery(aobId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var matrix = result.Data;
        matrix.Should().NotBeNull();
        matrix!.Bids.Should().HaveCount(2);

        var alphaBid = matrix.Bids.First(b => b.SupplierId == supplier1Id);
        alphaBid.IsOverABC.Should().BeFalse();
        alphaBid.Rank.Should().Be(1);
        alphaBid.Score.Should().Be(100m);

        var betaBid = matrix.Bids.First(b => b.SupplierId == supplier2Id);
        betaBid.IsOverABC.Should().BeTrue();
        betaBid.Rank.Should().Be(0); // Disqualified from ranking
    }

    [Fact]
    public async Task Handle_SealedBids_ShouldHideBidDetailsBeforeOpeningDate()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var rfqItemId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();
        var aobId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Supplier Alpha", Email = "alpha@example.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-002",
            TracingNumber = "TR-002",
            Status = StatusEnum.Approved,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            RFQItems =
            [
                new RFQItem
                {
                    Id = rfqItemId,
                    RFQId = rfqId,
                    ItemNameSnapshot = "Printer",
                    UnitPriceSnapshot = 15000m,
                    Quantity = 1
                }
            ]
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-002",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft,
            AOBDate = DateOnly.FromDateTime(DateTime.UtcNow),
            OpeningDate = DateTime.UtcNow.AddDays(2), // Future date (sealed)
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);

        var bid = new SupplierBid
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            SupplierId = supplierId,
            Status = "SUBMITTED",
            SupplierBidItems =
            [
                new SupplierBidItem
                {
                    RFQItemId = rfqItemId,
                    UnitPrice = 12000m,
                    TotalPrice = 12000m,
                    Brand = "BrandX",
                    Model = "ModelY",
                    IsResponsive = true
                }
            ]
        };
        context.SupplierBids?.Add(bid);
        await context.SaveChangesAsync();

        var handler = new GetAOBMatrixQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetAOBMatrixQuery(aobId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        var matrix = result.Data!;
        matrix.IsBidsOpened.Should().BeFalse();
        matrix.Bids.First().UnitPrice.Should().Be(0);
        matrix.Bids.First().Brand.Should().BeNull();
        matrix.Bids.First().Model.Should().BeNull();
    }

    [Fact]
    public async Task Handle_FewerThanThreeSuppliers_ShouldFlagMinimumCanvassWarning()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();
        var aobId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Supplier Solo", Email = "solo@example.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-2026-003",
            TracingNumber = "TR-003",
            Status = StatusEnum.Approved,
            Date = DateOnly.FromDateTime(DateTime.UtcNow)
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-003",
            Status = StatusEnum.Draft,
            OpeningDate = DateTime.UtcNow.AddHours(-1),
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);

        var bid = new SupplierBid
        {
            Id = Guid.NewGuid(),
            RFQId = rfqId,
            SupplierId = supplierId,
            Status = "SUBMITTED"
        };
        context.SupplierBids?.Add(bid);
        await context.SaveChangesAsync();

        var handler = new GetAOBMatrixQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetAOBMatrixQuery(aobId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.HasMinimumCanvassWarning.Should().BeTrue();
    }
}

public class SieveOptionsAccessor : Microsoft.Extensions.Options.IOptions<Sieve.Models.SieveOptions>
{
    public Sieve.Models.SieveOptions Value => new();
}
