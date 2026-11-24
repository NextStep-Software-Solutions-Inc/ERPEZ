using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ApprovePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.ReturnPurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.SubmitPurchaseOrderForApproval;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;

public class WorkflowPurchaseOrderCommandHandlerTests
{
    [Fact]
    public async Task Handle_DraftPo_ShouldSubmitForApproval()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-SUBMIT-001",
            Status = StatusEnum.Draft
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new SubmitPurchaseOrderForApprovalCommandHandler(unitOfWork);
        var result = await handler.Handle(new SubmitPurchaseOrderForApprovalCommand(po.Id), CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == po.Id);
        updated!.Status.Should().Be(StatusEnum.ForApproval);
    }

    [Fact]
    public async Task Handle_ReturnedPo_ShouldSubmitForApproval()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-RETURNED-001",
            Status = StatusEnum.Returned,
            ReturnReason = "Missing delivery address"
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new SubmitPurchaseOrderForApprovalCommandHandler(unitOfWork);
        var result = await handler.Handle(new SubmitPurchaseOrderForApprovalCommand(po.Id), CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == po.Id);
        updated!.Status.Should().Be(StatusEnum.ForApproval);
        updated.ReturnReason.Should().BeNull(); // Cleared upon re-submission
    }

    [Fact]
    public async Task Handle_AlreadyApprovedPo_ShouldFailSubmitForApproval()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-APPROVED-001",
            Status = StatusEnum.Approved
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new SubmitPurchaseOrderForApprovalCommandHandler(unitOfWork);
        var result = await handler.Handle(new SubmitPurchaseOrderForApprovalCommand(po.Id), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Only Draft or Returned");
    }

    [Fact]
    public async Task Handle_ForApprovalPo_ShouldApprove()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-APPROVE-001",
            Status = StatusEnum.ForApproval
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new ApprovePurchaseOrderCommandHandler(unitOfWork, PurchaseOrderTestHelpers.CreateCurrentUserService());
        var result = await handler.Handle(new ApprovePurchaseOrderCommand(po.Id), CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == po.Id);
        updated!.Status.Should().Be(StatusEnum.Approved);
        updated.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_DraftPo_ShouldFailApproval()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-DRAFT-001",
            Status = StatusEnum.Draft
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new ApprovePurchaseOrderCommandHandler(unitOfWork, PurchaseOrderTestHelpers.CreateCurrentUserService());
        var result = await handler.Handle(new ApprovePurchaseOrderCommand(po.Id), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Only Purchase Orders pending approval");
    }

    [Fact]
    public async Task Handle_ForApprovalPo_ShouldReturnWithReason()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-RETURN-001",
            Status = StatusEnum.ForApproval
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new ReturnPurchaseOrderCommandHandler(unitOfWork);
        var command = new ReturnPurchaseOrderCommand(po.Id, "Items specification mismatch");
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();

        var updated = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == po.Id);
        updated!.Status.Should().Be(StatusEnum.Returned);
        updated.ReturnReason.Should().Be("Items specification mismatch");
    }

    [Fact]
    public async Task Handle_DraftPo_ShouldFailReturn()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var po = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-DRAFT-RET-001",
            Status = StatusEnum.Draft
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(po);
        await unitOfWork.SaveChangesAsync();

        var handler = new ReturnPurchaseOrderCommandHandler(unitOfWork);
        var command = new ReturnPurchaseOrderCommand(po.Id, "Some reason");
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Only Purchase Orders pending approval can be returned.");
    }
}
