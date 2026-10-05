using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBs;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.AOB;

public class GetAOBsQueryHandlerTests
{
    private static ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private static (IUnitOfWork UnitOfWork, ISieveProcessor SieveProcessor) CreateDependencies(ApplicationDbContext context)
    {
        var services = new ServiceCollection();
        services.AddScoped<ISieveProcessor, SieveProcessor>();
        services.AddSingleton<IOptions<SieveOptions>>(new SieveOptionsAccessor());
        var serviceProvider = services.BuildServiceProvider();
        var sieveProcessor = serviceProvider.GetRequiredService<ISieveProcessor>();
        return (new UnitOfWork(context, serviceProvider), sieveProcessor);
    }

    [Fact]
    public async Task Handle_WhenAOBHasSingleLinkedRFQ_ShouldReturnRFQNumberAndRFQNumbers()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (unitOfWork, sieveProcessor) = CreateDependencies(context);

        var aobId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "2026-SVP-RFQ-001",
            TracingNumber = "TRC-001",
            Status = StatusEnum.Approved
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "2026-SVP-AOB-001",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft
        };
        context.AOBs?.Add(aob);

        var mapping = new AOBRFQMapping
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQId = rfqId,
            AOB = aob,
            RFQ = rfq
        };
        context.AOBRFQMappings?.Add(mapping);
        await context.SaveChangesAsync();

        var handler = new GetAOBsQueryHandler(unitOfWork, sieveProcessor);

        // Act
        var result = await handler.Handle(new GetAOBsQuery { PageNumber = 1, PageSize = 10 }, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        var item = result.Data![0];
        item.AOBNumber.Should().Be("2026-SVP-AOB-001");
        item.RFQNumber.Should().Be("2026-SVP-RFQ-001");
        item.RFQNumbers.Should().ContainSingle().Which.Should().Be("2026-SVP-RFQ-001");
        item.RFQIds.Should().ContainSingle().Which.Should().Be(rfqId);
    }

    [Fact]
    public async Task Handle_WhenAOBHasMultipleLinkedRFQs_ShouldReturnCommaSeparatedRFQNumbers()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (unitOfWork, sieveProcessor) = CreateDependencies(context);

        var aobId = Guid.NewGuid();
        var rfq1Id = Guid.NewGuid();
        var rfq2Id = Guid.NewGuid();

        var rfq1 = new RFQ
        {
            Id = rfq1Id,
            RFQNumber = "2026-SVP-RFQ-001",
            TracingNumber = "TRC-001",
            Status = StatusEnum.Approved
        };
        var rfq2 = new RFQ
        {
            Id = rfq2Id,
            RFQNumber = "2026-SVP-RFQ-002",
            TracingNumber = "TRC-002",
            Status = StatusEnum.Approved
        };
        context.RFQs?.AddRange(rfq1, rfq2);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "2026-SVP-AOB-002",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft
        };
        context.AOBs?.Add(aob);

        var mapping1 = new AOBRFQMapping
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQId = rfq1Id,
            AOB = aob,
            RFQ = rfq1
        };
        var mapping2 = new AOBRFQMapping
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQId = rfq2Id,
            AOB = aob,
            RFQ = rfq2
        };
        context.AOBRFQMappings?.AddRange(mapping1, mapping2);
        await context.SaveChangesAsync();

        var handler = new GetAOBsQueryHandler(unitOfWork, sieveProcessor);

        // Act
        var result = await handler.Handle(new GetAOBsQuery { PageNumber = 1, PageSize = 10 }, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        var item = result.Data![0];
        item.RFQNumber.Should().Be("2026-SVP-RFQ-001, 2026-SVP-RFQ-002");
        item.RFQNumbers.Should().BeEquivalentTo(new[] { "2026-SVP-RFQ-001", "2026-SVP-RFQ-002" });
        item.RFQIds.Should().BeEquivalentTo(new[] { rfq1Id, rfq2Id });
    }

    [Fact]
    public async Task Handle_WhenAOBHasNoLinkedRFQs_ShouldReturnNullRFQNumber()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (unitOfWork, sieveProcessor) = CreateDependencies(context);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = Guid.NewGuid(),
            AOBNumber = "2026-SVP-AOB-EMPTY",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var handler = new GetAOBsQueryHandler(unitOfWork, sieveProcessor);

        // Act
        var result = await handler.Handle(new GetAOBsQuery { PageNumber = 1, PageSize = 10 }, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().NotBeNull();
        result.Data!.Should().HaveCount(1);
        var item = result.Data![0];
        item.RFQNumber.Should().BeNull();
        item.RFQNumbers.Should().BeEmpty();
        item.RFQIds.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAOBById_WhenAOBHasLinkedRFQ_ShouldReturnRFQNumber()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var (unitOfWork, _) = CreateDependencies(context);

        var aobId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "2026-SVP-RFQ-DETAIL",
            TracingNumber = "TRC-DETAIL",
            Status = StatusEnum.Approved
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "2026-SVP-AOB-DETAIL",
            AwardCriterion = BidEvaluationCriteria.LCRB,
            Status = StatusEnum.Draft
        };
        context.AOBs?.Add(aob);

        var mapping = new AOBRFQMapping
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQId = rfqId,
            AOB = aob,
            RFQ = rfq
        };
        context.AOBRFQMappings?.Add(mapping);
        await context.SaveChangesAsync();

        var handler = new GetAOBByIdQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetAOBByIdQuery(aobId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.RFQNumber.Should().Be("2026-SVP-RFQ-DETAIL");
        result.Data.RFQs.Should().ContainSingle().Which.RFQNumber.Should().Be("2026-SVP-RFQ-DETAIL");
    }
}
