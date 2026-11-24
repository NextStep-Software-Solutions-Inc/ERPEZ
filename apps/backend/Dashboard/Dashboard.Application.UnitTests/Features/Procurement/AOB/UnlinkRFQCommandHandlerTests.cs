using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.AOBs.Commands.UnlinkRFQ;
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

public class UnlinkRFQCommandHandlerTests
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
    public async Task Handle_AOBNotFound_ShouldReturnFail()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var handler = new UnlinkRFQCommandHandler(unitOfWork);
        var command = new UnlinkRFQCommand(Guid.NewGuid(), Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }

    [Theory]
    [InlineData(StatusEnum.Approved)]
    [InlineData(StatusEnum.ForApproval)]
    [InlineData(StatusEnum.Submitted)]
    public async Task Handle_NonDraftOrReturnedStatus_ShouldReturnFail(StatusEnum invalidStatus)
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-001",
            Status = invalidStatus,
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var handler = new UnlinkRFQCommandHandler(unitOfWork);
        var command = new UnlinkRFQCommand(aobId, rfqId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Cannot unlink RFQ");
        result.Message.Should().Contain("Only Draft or Returned AOBs can be modified");
    }

    [Fact]
    public async Task Handle_RFQNotLinkedToAOB_ShouldReturnFail()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var linkedRfqId = Guid.NewGuid();
        var unlinkedRfqId = Guid.NewGuid();

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-001",
            Status = StatusEnum.Draft,
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = linkedRfqId }]
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var handler = new UnlinkRFQCommandHandler(unitOfWork);
        var command = new UnlinkRFQCommand(aobId, unlinkedRfqId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not linked to this AOB");
    }

    [Fact]
    public async Task Handle_ValidDraftAOB_ShouldUnlinkRFQ_AndCleanUpAssociatedAwardedItems()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var rfq1Id = Guid.NewGuid();
        var rfq1ItemId = Guid.NewGuid();
        var rfq2Id = Guid.NewGuid();
        var rfq2ItemId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();

        var rfq1 = new RFQ
        {
            Id = rfq1Id,
            RFQNumber = "RFQ-001",
            RFQItems = [new RFQItem { Id = rfq1ItemId, RFQId = rfq1Id, ItemNameSnapshot = "Item 1" }]
        };

        var rfq2 = new RFQ
        {
            Id = rfq2Id,
            RFQNumber = "RFQ-002",
            RFQItems = [new RFQItem { Id = rfq2ItemId, RFQId = rfq2Id, ItemNameSnapshot = "Item 2" }]
        };

        context.RFQs?.AddRange(rfq1, rfq2);

        var mapping1 = new AOBRFQMapping { Id = Guid.NewGuid(), AOBId = aobId, RFQId = rfq1Id };
        var mapping2 = new AOBRFQMapping { Id = Guid.NewGuid(), AOBId = aobId, RFQId = rfq2Id };

        var awarded1 = new AOBAwardedItem
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQItemId = rfq1ItemId,
            WinningSupplierId = supplierId,
            AwardedUnitPrice = 500m,
            AwardedQuantity = 2,
            TotalAwardedAmount = 1000m
        };

        var awarded2 = new AOBAwardedItem
        {
            Id = Guid.NewGuid(),
            AOBId = aobId,
            RFQItemId = rfq2ItemId,
            WinningSupplierId = supplierId,
            AwardedUnitPrice = 300m,
            AwardedQuantity = 1,
            TotalAwardedAmount = 300m
        };

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-001",
            Status = StatusEnum.Draft,
            AOBRFQMappings = [mapping1, mapping2],
            AOBAwardedItems = [awarded1, awarded2]
        };

        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var handler = new UnlinkRFQCommandHandler(unitOfWork);
        var command = new UnlinkRFQCommand(aobId, rfq1Id);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Contain("unlinked successfully");

        // Verify AOB mapping was removed
        var updatedAob = await context.AOBs!
            .Include(a => a.AOBRFQMappings)
            .Include(a => a.AOBAwardedItems)
            .FirstOrDefaultAsync(a => a.Id == aobId);

        updatedAob.Should().NotBeNull();
        updatedAob!.AOBRFQMappings.Should().HaveCount(1);
        updatedAob.AOBRFQMappings.First().RFQId.Should().Be(rfq2Id);

        // Verify awarded item for RFQ1 was removed, but RFQ2 awarded item remains
        updatedAob.AOBAwardedItems.Should().HaveCount(1);
        updatedAob.AOBAwardedItems.First().RFQItemId.Should().Be(rfq2ItemId);
    }

    [Fact]
    public async Task Handle_ValidReturnedAOB_ShouldAllowUnlink()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-001",
            RFQItems = []
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-RET",
            Status = StatusEnum.Returned,
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var handler = new UnlinkRFQCommandHandler(unitOfWork);
        var command = new UnlinkRFQCommand(aobId, rfqId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Contain("unlinked successfully");
    }
}
