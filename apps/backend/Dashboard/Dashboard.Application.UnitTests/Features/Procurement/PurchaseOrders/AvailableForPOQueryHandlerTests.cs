using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.AOBs.Queries.GetApprovedAobsAvailableForPO;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetApprovedDaResolutionsAvailableForPO;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetApprovedNoasAvailableForPO;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace Dashboard.Application.UnitTests.Features.Procurement.PurchaseOrders;

public class AvailableForPOQueryHandlerTests
{
    [Fact]
    public async Task GetApprovedAobs_ShouldReturnOnlyApprovedAndUnlinkedAobs()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Supplier A",
            Status = nameof(SupplierStatusEnum.Approved)
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        // 1. Approved & unlinked AOB (Should be included)
        var aobAvailable = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = Guid.NewGuid(),
            AOBNumber = "AOB-AVAIL-001",
            Status = StatusEnum.Approved,
            AOBAwardedItems = new List<AOBAwardedItem>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    WinningSupplierId = supplier.Id,
                    AwardedQuantity = 5,
                    AwardedUnitPrice = 100m,
                    TotalAwardedAmount = 500m
                }
            }
        };
        await unitOfWork.AOBRepository.AddAsync(aobAvailable);

        // 2. Draft AOB (Should be excluded)
        var aobDraft = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = Guid.NewGuid(),
            AOBNumber = "AOB-DRAFT-002",
            Status = StatusEnum.Draft
        };
        await unitOfWork.AOBRepository.AddAsync(aobDraft);

        // 3. Approved but linked to an active PO (Should be excluded)
        var aobLinked = new ERPEZ.Domain.Entities.Procurement.AOB
        {
            Id = Guid.NewGuid(),
            AOBNumber = "AOB-LINKED-003",
            Status = StatusEnum.Approved
        };
        await unitOfWork.AOBRepository.AddAsync(aobLinked);

        var activePo = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-LINKED-AOB",
            Status = StatusEnum.Draft,
            SourceDocumentType = SourceDocumentTypeEnum.AOB,
            SourceDocumentId = aobLinked.Id
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(activePo);
        await unitOfWork.SaveChangesAsync();

        var handler = new GetApprovedAobsAvailableForPOQueryHandler(unitOfWork);
        var result = await handler.Handle(new GetApprovedAobsAvailableForPOQuery(), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data[0].AOBNumber.Should().Be("AOB-AVAIL-001");
        result.Data[0].WinningSupplierName.Should().Be("Supplier A");
    }

    [Fact]
    public async Task GetApprovedNoas_ShouldReturnOnlyApprovedAndUnlinkedNoas()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = "Supplier B",
            Status = nameof(SupplierStatusEnum.Approved)
        };
        await unitOfWork.SupplierRepository.AddAsync(supplier);

        // 1. Approved & unlinked NOA
        var noaAvailable = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-AVAIL-001",
            Status = NoticeOfAwardStatus.Approved,
            SupplierId = supplier.Id,
            AwardedAmount = 25000m
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noaAvailable);

        // 2. Draft NOA
        var noaDraft = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-DRAFT-002",
            Status = NoticeOfAwardStatus.Draft,
            SupplierId = supplier.Id
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noaDraft);

        // 3. Approved but linked NOA
        var noaLinked = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = "NOA-LINKED-003",
            Status = NoticeOfAwardStatus.Approved,
            SupplierId = supplier.Id
        };
        await unitOfWork.NoticeOfAwardRepository.AddAsync(noaLinked);

        var activePo = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-LINKED-NOA",
            Status = StatusEnum.Draft,
            SourceDocumentType = SourceDocumentTypeEnum.NOA,
            SourceDocumentId = noaLinked.Id
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(activePo);
        await unitOfWork.SaveChangesAsync();

        var handler = new GetApprovedNoasAvailableForPOQueryHandler(unitOfWork);
        var result = await handler.Handle(new GetApprovedNoasAvailableForPOQuery(), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data[0].NOANumber.Should().Be("NOA-AVAIL-001");
        result.Data[0].SupplierName.Should().Be("Supplier B");
    }

    [Fact]
    public async Task GetApprovedDaResolutions_ShouldReturnOnlyApprovedAndUnlinkedDas()
    {
        using var context = PurchaseOrderTestHelpers.CreateInMemoryDbContext();
        var unitOfWork = PurchaseOrderTestHelpers.CreateUnitOfWork(context);

        var cpr = new ConsolidatedPR
        {
            Id = Guid.NewGuid(),
            CPRNumber = "CPR-TEST-001"
        };
        await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);

        // 1. Approved & unlinked DA
        var daAvailable = new DirectAcquisition
        {
            Id = Guid.NewGuid(),
            DANumber = "DA-AVAIL-001",
            Status = DirectAcquisitionStatusEnum.APPROVED,
            ConsolidatedPRId = cpr.Id,
            ConsolidatedPR = cpr,
            TotalABC = 12000m
        };
        await unitOfWork.DirectAcquisitionRepository.AddAsync(daAvailable);

        // 2. Draft DA
        var daDraft = new DirectAcquisition
        {
            Id = Guid.NewGuid(),
            DANumber = "DA-DRAFT-002",
            Status = DirectAcquisitionStatusEnum.DRAFT,
            ConsolidatedPRId = cpr.Id,
            ConsolidatedPR = cpr
        };
        await unitOfWork.DirectAcquisitionRepository.AddAsync(daDraft);

        // 3. Approved but linked DA
        var daLinked = new DirectAcquisition
        {
            Id = Guid.NewGuid(),
            DANumber = "DA-LINKED-003",
            Status = DirectAcquisitionStatusEnum.APPROVED,
            ConsolidatedPRId = cpr.Id,
            ConsolidatedPR = cpr
        };
        await unitOfWork.DirectAcquisitionRepository.AddAsync(daLinked);

        var activePo = new PurchaseOrder
        {
            Id = Guid.NewGuid(),
            PONumber = "PO-LINKED-DA",
            Status = StatusEnum.Draft,
            SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION,
            SourceDocumentId = daLinked.Id
        };
        await unitOfWork.PurchaseOrderRepository.AddAsync(activePo);
        await unitOfWork.SaveChangesAsync();

        var handler = new GetApprovedDaResolutionsAvailableForPOQueryHandler(unitOfWork);
        var result = await handler.Handle(new GetApprovedDaResolutionsAvailableForPOQuery(), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data[0].DANumber.Should().Be("DA-AVAIL-001");
        result.Data[0].CPRNumber.Should().Be("CPR-TEST-001");
    }
}
