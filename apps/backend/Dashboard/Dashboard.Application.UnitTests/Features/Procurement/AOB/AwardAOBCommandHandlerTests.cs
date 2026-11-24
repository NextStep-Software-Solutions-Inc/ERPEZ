using ERPEZ.Application.Features.Procurement.AOBs.Commands.AwardAOB;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
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

public class AwardAOBCommandHandlerTests
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
    public async Task Handle_ValidAward_ShouldStoreWinners_AndCalculateTotals()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();
        var rfqItemId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Winning Supplies Inc." };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-001",
            RFQItems =
            [
                new RFQItem
                {
                    Id = rfqItemId,
                    RFQId = rfqId,
                    ItemNameSnapshot = "Projector",
                    UnitPriceSnapshot = 25000m,
                    Quantity = 3
                }
            ]
        };
        context.RFQs?.Add(rfq);

        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-001",
            Status = StatusEnum.Draft,
            AOBRFQMappings = [new AOBRFQMapping { AOBId = aobId, RFQId = rfqId }]
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var command = new AwardAOBCommand
        {
            AOBId = aobId,
            AwardedItems =
            [
                new AwardItemInputDto
                {
                    RFQItemId = rfqItemId,
                    WinningSupplierId = supplierId,
                    AwardedUnitPrice = 24000m,
                    AwardedQuantity = 3,
                    Score = 100m,
                    AwardReason = "Lowest calculated responsive quotation"
                }
            ]
        };

        var handler = new AwardAOBCommandHandler(unitOfWork);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var updatedAob = await context.AOBs!.Include(a => a.AOBAwardedItems).FirstAsync(a => a.Id == aobId);
        updatedAob.AOBAwardedItems.Should().HaveCount(1);

        var awardedItem = updatedAob.AOBAwardedItems.First();
        awardedItem.WinningSupplierId.Should().Be(supplierId);
        awardedItem.AwardedUnitPrice.Should().Be(24000m);
        awardedItem.AwardedQuantity.Should().Be(3);
        awardedItem.TotalAwardedAmount.Should().Be(72000m);
        awardedItem.AwardReason.Should().Be("Lowest calculated responsive quotation");
    }

    [Fact]
    public async Task Handle_ApprovedAOB_ShouldRejectReAwarding()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var aobId = Guid.NewGuid();
        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-APPROVED",
            Status = StatusEnum.Approved
        };
        context.AOBs?.Add(aob);
        await context.SaveChangesAsync();

        var command = new AwardAOBCommand
        {
            AOBId = aobId,
            AwardedItems =
            [
                new AwardItemInputDto
                {
                    RFQItemId = Guid.NewGuid(),
                    WinningSupplierId = Guid.NewGuid(),
                    AwardedUnitPrice = 1000m
                }
            ]
        };

        var handler = new AwardAOBCommandHandler(unitOfWork);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already been approved");
    }
}
