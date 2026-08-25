using ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;
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

public class SubmitSupplierBidCommandHandlerTests
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
    public async Task Handle_NewBid_ShouldCreateBid_AndCalculateLineTotals()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var rfqId = Guid.NewGuid();
        var rfqItemId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Test Supplier", Email = "supplier@test.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-BID-001",
            RFQItems =
            [
                new RFQItem
                {
                    Id = rfqItemId,
                    RFQId = rfqId,
                    ItemNameSnapshot = "Desktop Computer",
                    Quantity = 5,
                    UnitPriceSnapshot = 40000m
                }
            ],
            RFQSuppliers =
            [
                new RFQSupplier
                {
                    RFQId = rfqId,
                    SupplierId = supplierId
                }
            ]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var command = new SubmitSupplierBidCommand
        {
            RFQId = rfqId,
            SupplierId = supplierId,
            SubmissionType = "Electronic",
            Status = "SUBMITTED",
            ValidityPeriodDays = 60,
            DeliveryPeriod = "15 Calendar Days",
            PaymentTerms = "30 Days Net",
            Items =
            [
                new SupplierBidItemDto
                {
                    RFQItemId = rfqItemId,
                    UnitPrice = 38000m,
                    Brand = "Dell",
                    Model = "OptiPlex 7090",
                    Color = "Black",
                    IsResponsive = true
                }
            ]
        };

        var handler = new SubmitSupplierBidCommandHandler(unitOfWork);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var createdBid = await context.SupplierBids!
            .Include(b => b.SupplierBidItems)
            .FirstAsync(b => b.Id == result.Data);

        createdBid.TotalAmount.Should().Be(190000m); // 38,000 * 5
        createdBid.Status.Should().Be("SUBMITTED");
        createdBid.ValidityPeriodDays.Should().Be(60);
        createdBid.SupplierBidItems.Should().HaveCount(1);
        createdBid.SupplierBidItems.First().TotalPrice.Should().Be(190000m);
    }

    [Fact]
    public async Task Handle_NonExistentRFQ_ShouldReturnFail()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var command = new SubmitSupplierBidCommand
        {
            RFQId = Guid.NewGuid(),
            SupplierId = Guid.NewGuid(),
            Status = "DRAFT",
            Items = []
        };

        var handler = new SubmitSupplierBidCommandHandler(unitOfWork);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}
