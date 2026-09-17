using Dashboard.Application.UnitTests.Features.Procurement.AOB;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQDetails;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQInvitations;
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

namespace Dashboard.Application.UnitTests.Features.Procurement.SupplierPortal;

public class SupplierPortalRFQQueriesTests
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
    public async Task GetSupplierRFQInvitations_ShouldOnlyReturnApprovedRFQs()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplierId = Guid.NewGuid();
        var supplier = new Supplier { Id = supplierId, Name = "Test Supplier", Email = "supplier@test.com" };
        context.Suppliers?.Add(supplier);

        // 1 Approved RFQ (should be returned)
        var approvedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-APPROVED-001",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { SupplierId = supplierId }]
        };

        // 1 Draft RFQ (should be excluded)
        var draftRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-DRAFT-001",
            Status = StatusEnum.Draft,
            RFQSuppliers = [new RFQSupplier { SupplierId = supplierId }]
        };

        // 1 Submitted RFQ (should be excluded)
        var submittedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-SUBMITTED-001",
            Status = StatusEnum.Submitted,
            RFQSuppliers = [new RFQSupplier { SupplierId = supplierId }]
        };

        // 1 Returned RFQ (should be excluded)
        var returnedRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-RETURNED-001",
            Status = StatusEnum.Returned,
            RFQSuppliers = [new RFQSupplier { SupplierId = supplierId }]
        };

        // 1 Approved RFQ for another supplier (should be excluded)
        var otherRfq = new RFQ
        {
            Id = Guid.NewGuid(),
            RFQNumber = "RFQ-OTHER-001",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { SupplierId = Guid.NewGuid() }]
        };

        context.RFQs?.AddRange(approvedRfq, draftRfq, submittedRfq, returnedRfq, otherRfq);
        await context.SaveChangesAsync();

        var handler = new GetSupplierRFQInvitationsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierRFQInvitationsQuery(supplierId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data.First().RFQNumber.Should().Be("RFQ-APPROVED-001");
        result.Data.First().Status.Should().Be(StatusEnum.Approved);
    }

    [Fact]
    public async Task GetSupplierRFQDetails_WhenApproved_ShouldReturnSuccess()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplierId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Test Supplier", Email = "supplier@test.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-APP-001",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = rfqId, SupplierId = supplierId, InvitedAt = DateTime.UtcNow }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var handler = new GetSupplierRFQDetailsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierRFQDetailsQuery(rfqId, supplierId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.RFQNumber.Should().Be("RFQ-APP-001");
        result.Data.Status.Should().Be(StatusEnum.Approved);
    }

    [Theory]
    [InlineData(StatusEnum.Draft)]
    [InlineData(StatusEnum.Submitted)]
    [InlineData(StatusEnum.Returned)]
    public async Task GetSupplierRFQDetails_WhenNotApproved_ShouldReturnFail(StatusEnum status)
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var supplierId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var supplier = new Supplier { Id = supplierId, Name = "Test Supplier", Email = "supplier@test.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-UNAPP-001",
            Status = status,
            RFQSuppliers = [new RFQSupplier { RFQId = rfqId, SupplierId = supplierId, InvitedAt = DateTime.UtcNow }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var handler = new GetSupplierRFQDetailsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierRFQDetailsQuery(rfqId, supplierId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not approved");
    }

    [Fact]
    public async Task GetSupplierRFQDetails_WhenSupplierNotInvited_ShouldReturnFail()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var unitOfWork = CreateUnitOfWork(context);

        var invitedSupplierId = Guid.NewGuid();
        var uninvitedSupplierId = Guid.NewGuid();
        var rfqId = Guid.NewGuid();

        var supplier = new Supplier { Id = invitedSupplierId, Name = "Test Supplier", Email = "supplier@test.com" };
        context.Suppliers?.Add(supplier);

        var rfq = new RFQ
        {
            Id = rfqId,
            RFQNumber = "RFQ-UNINVITED-001",
            Status = StatusEnum.Approved,
            RFQSuppliers = [new RFQSupplier { RFQId = rfqId, SupplierId = invitedSupplierId, InvitedAt = DateTime.UtcNow }]
        };
        context.RFQs?.Add(rfq);
        await context.SaveChangesAsync();

        var handler = new GetSupplierRFQDetailsQueryHandler(unitOfWork);

        // Act
        var result = await handler.Handle(new GetSupplierRFQDetailsQuery(rfqId, uninvitedSupplierId), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not been invited");
    }
}
