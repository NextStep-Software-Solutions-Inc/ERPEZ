using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;

public class CreatePurchaseOrderCommandHandlerTests
{
    [Fact]
    public async Task Handle_AobSourceDocument_ShouldAutoFillWinningSupplierAndItems()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Winning SVP Supplier Ltd.",
            TINNumber = "123-456-789",
            Status = nameof(SupplierStatusEnum.Approved)
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var aobId = Guid.NewGuid();
        var aob = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = aobId,
            AOBNumber = "AOB-2026-001",
            Status = StatusEnum.Approved,
            AOBAwardedItems = new List<AOBAwardedItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    AOBId = aobId,
                    WinningSupplierId = supplier.Id,
                    AwardedQuantity = 10,
                    AwardedUnitPrice = 150m,
                    TotalAwardedAmount = 1500m
                }
            }
        };
        await unitOfWork.AOBRepository.AddAsync(aob);
        await unitOfWork.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand
        {
            PONumber = "PO-2026-SVP-001",
            ProcurementMode = POProcurementModeEnum.SVP,
            SourceDocumentType = SourceDocumentTypeEnum.AOB,
            SourceDocumentId = aobId,
            SupplierId = null,
            RetailStoreInfo = null,
            Description = "SVP Purchase Order Description",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            PlaceOfDelivery = "Main Office",
            DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            DeliveryTerm = "7 Calendar Days",
            PaymentTerm = "Net 30",
            SupportingDocumentUrl = "https://example.com/file.pdf"
        };

        var handler = new CreatePurchaseOrderCommandHandler(unitOfWork);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var po = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == result.Data);
        po.Should().NotBeNull();
        po!.PONumber.Should().Be("PO-2026-SVP-001");
        po.SupplierId.Should().Be(supplier.Id);
        po.TotalAmount.Should().Be(1500m);
        po.PurchaseOrderItems.Should().HaveCount(1);
        po.PurchaseOrderItems[0].Quantity.Should().Be(10);
        po.PurchaseOrderItems[0].UnitPrice.Should().Be(150m);
        po.PurchaseOrderItems[0].Amount.Should().Be(1500m);
    }

    [Fact]
    public async Task Handle_NoaSourceDocument_ShouldAutoFillSupplierAndLineItems()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Public Bidding Corp.",
            TINNumber = "999-888-777",
            Status = nameof(SupplierStatusEnum.Approved)
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        var noaId = Guid.NewGuid();
        var noa = new NoticeOfAward
        {
            Id = noaId,
            NOANumber = "NOA-2026-PB-001",
            SupplierId = supplier.Id,
            Status = NoticeOfAwardStatus.Approved,
            AwardedAmount = 50000m,
            Description = "Heavy Duty Server"
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa);
        await unitOfWork.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand
        {
            PONumber = "PO-2026-PB-001",
            ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING,
            SourceDocumentType = SourceDocumentTypeEnum.NOA,
            SourceDocumentId = noaId,
            SupplierId = null,
            RetailStoreInfo = null,
            Description = "Public Bidding Server Procurement",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            PlaceOfDelivery = "Data Center",
            DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
            DeliveryTerm = "30 Days",
            PaymentTerm = "Net 60",
            SupportingDocumentUrl = null
        };

        var handler = new CreatePurchaseOrderCommandHandler(unitOfWork);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var po = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == result.Data);
        po.Should().NotBeNull();
        po!.SupplierId.Should().Be(supplier.Id);
        po.TotalAmount.Should().Be(50000m);
        po.PurchaseOrderItems.Should().HaveCount(1);
        po.PurchaseOrderItems[0].Description.Should().Be("Heavy Duty Server");
        po.PurchaseOrderItems[0].Quantity.Should().Be(1);
        po.PurchaseOrderItems[0].UnitPrice.Should().Be(50000m);
    }

    [Fact]
    public async Task Handle_DaSourceDocument_WithRetailStoreInfo_ShouldCreateSupplierAndAutoFillItems()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var daId = Guid.NewGuid();
        var cprId = Guid.NewGuid();

        var prItem = new PRItem
        {
            Id = Guid.NewGuid(),
            Name = "A4 Copy Paper",
            RequestedQuantity = 20,
            UnitCost = 250m,
            Amount = 5000m
        };

        var cpr = new ConsolidatedPR
        {
            Id = cprId,
            CPRNumber = "CPR-2026-001",
            ConsolidatedPRItems = new List<ConsolidatedPRItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ConsolidatedPRId = cprId,
                    PRItemId = prItem.Id,
                    PRItem = prItem
                }
            }
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        var da = new DirectAcquisition
        {
            Id = daId,
            DANumber = "DA-2026-001",
            ConsolidatedPRId = cprId,
            ConsolidatedPR = cpr,
            Status = DirectAcquisitionStatusEnum.APPROVED,
            TotalABC = 5000m
        };
        await unitOfWork.DirectAcquisitionRepository.AddAsync(da);
        await unitOfWork.SaveChangesAsync();

        var retailStore = new RetailStoreInfoDto
        {
            Name = "National Bookstore Retail Branch",
            TIN = "111-222-333-000",
            Address = "SM Mall Branch, Manila"
        };

        var command = new CreatePurchaseOrderCommand
        {
            PONumber = "PO-2026-DA-001",
            ProcurementMode = POProcurementModeEnum.DIRECT_ACQUISITION,
            SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION,
            SourceDocumentId = daId,
            SupplierId = null,
            RetailStoreInfo = retailStore,
            Description = "Office Supplies Acquisition",
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            PlaceOfDelivery = "Admin Office",
            DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
            DeliveryTerm = "Immediate",
            PaymentTerm = "Cash on Delivery",
            SupportingDocumentUrl = null
        };

        var handler = new CreatePurchaseOrderCommandHandler(unitOfWork);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeEmpty();

        var po = await unitOfWork.PurchaseOrderRepository.FindAsync(p => p.Id == result.Data);
        po.Should().NotBeNull();
        po!.SupplierId.Should().NotBeEmpty();
        po.TotalAmount.Should().Be(5000m);
        po.PurchaseOrderItems.Should().HaveCount(1);
        po.PurchaseOrderItems[0].Description.Should().Be("A4 Copy Paper");
        po.PurchaseOrderItems[0].Quantity.Should().Be(20);
        po.PurchaseOrderItems[0].UnitPrice.Should().Be(250m);

        // Verify supplier was auto-created on the fly
        var createdSupplier = await unitOfWork.SupplierRepository.FindAsync(s => s.Id == po.SupplierId);
        createdSupplier.Should().NotBeNull();
        createdSupplier!.Name.Should().Be("National Bookstore Retail Branch");
        createdSupplier.TINNumber.Should().Be("111-222-333-000");
    }

    [Fact]
    public async Task Handle_DuplicatePoNumber_ShouldReturnFailure()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var existingPo = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-DUPLICATE-001",
            Status = StatusEnum.Draft,
            TotalAmount = 1000m
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(existingPo);
        await unitOfWork.SaveChangesAsync();

        var command = new CreatePurchaseOrderCommand
        {
            PONumber = "PO-DUPLICATE-001",
            ProcurementMode = POProcurementModeEnum.SVP,
            SourceDocumentType = SourceDocumentTypeEnum.AOB,
            SourceDocumentId = Guid.NewGuid(),
            SupplierId = null,
            RetailStoreInfo = null,
            Description = null,
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            PlaceOfDelivery = null,
            DateOfDelivery = null,
            DeliveryTerm = null,
            PaymentTerm = null,
            SupportingDocumentUrl = null
        };

        var handler = new CreatePurchaseOrderCommandHandler(unitOfWork);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("already exists");
    }
}
