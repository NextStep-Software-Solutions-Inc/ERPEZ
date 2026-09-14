using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreatePurchaseOrderCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        // 1. Generate or validate PO Number
        int currentYear = DateTime.UtcNow.Year;
        string poNumber = request.PONumber?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(poNumber))
        {
            var allPos = await unitOfWork.PurchaseOrderRepository.GetAllPoNumbersAsync(cancellationToken);

            int maxSeq = 0;
            var pattern = new Regex($@"^PO-{currentYear}-(\d+)$", RegexOptions.IgnoreCase);

            foreach (var existingNum in allPos)
            {
                var match = pattern.Match(existingNum);
                if (match.Success && int.TryParse(match.Groups[1].Value, out int seq))
                {
                    if (seq > maxSeq) maxSeq = seq;
                }
            }

            poNumber = $"PO-{currentYear}-{(maxSeq + 1):D4}";
        }
        else
        {
            var existingByPoNumber = await unitOfWork.PurchaseOrderRepository
                .FindAsync(p => p.PONumber.ToLower() == poNumber.ToLower(), cancellationToken);
            if (existingByPoNumber != null)
            {
                return ApiResponse<Guid>.Fail($"Purchase Order with number '{poNumber}' already exists.");
            }
        }

        // 2. Guard against duplicate PO for the same source document
        var existingActivePo = await unitOfWork.PurchaseOrderRepository
            .FindAsync(p => p.SourceDocumentId == request.SourceDocumentId &&
                            p.SourceDocumentType == request.SourceDocumentType &&
                            p.Status != StatusEnum.Returned, cancellationToken);
        if (existingActivePo != null)
        {
            return ApiResponse<Guid>.Fail("An active Purchase Order already exists for this source document.");
        }

        Guid supplierId = Guid.Empty;
        List<PurchaseOrderItem> purchaseOrderItems = [];

        // 3. Resolve supplier and auto-populate line items based on SourceDocumentType
        switch (request.SourceDocumentType)
        {
            case SourceDocumentTypeEnum.AOB:
            {
                var aob = await unitOfWork.AOBRepository.GetByIdWithAwardedItemsAsync(request.SourceDocumentId, cancellationToken);

                if (aob == null)
                    return ApiResponse<Guid>.Fail("Abstract of Bids (AOB) not found.");

                if (aob.Status != StatusEnum.Approved)
                    return ApiResponse<Guid>.Fail("Abstract of Bids (AOB) must be approved before creating a Purchase Order.");

                if (aob.AOBAwardedItems == null || aob.AOBAwardedItems.Count == 0)
                    return ApiResponse<Guid>.Fail("The selected AOB has no awarded line items.");

                supplierId = aob.AOBAwardedItems.First().WinningSupplierId;

                purchaseOrderItems = aob.AOBAwardedItems.Select(ai => new PurchaseOrderItem
                {
                    SourceItemId = ai.RFQItemId,
                    Description = !string.IsNullOrWhiteSpace(ai.RFQItem?.ItemNameSnapshot)
                        ? ai.RFQItem.ItemNameSnapshot
                        : (ai.RFQItem?.CPRItem?.PRItem?.Name ?? "Procurement Item"),
                    Quantity = ai.AwardedQuantity,
                    Unit = ai.RFQItem?.CPRItem?.PRItem?.PPMPItem?.Unit ?? "unit",
                    UnitPrice = ai.AwardedUnitPrice,
                    Amount = ai.TotalAwardedAmount > 0 ? ai.TotalAwardedAmount : (ai.AwardedQuantity * ai.AwardedUnitPrice)
                }).ToList();
                break;
            }

            case SourceDocumentTypeEnum.NOA:
            {
                var noa = await unitOfWork.NoticeOfAwardRepository
                    .FindAsync(n => n.Id == request.SourceDocumentId, cancellationToken);

                if (noa == null)
                    return ApiResponse<Guid>.Fail("Notice of Award (NOA) not found.");

                if (noa.Status != NoticeOfAwardStatus.Approved)
                    return ApiResponse<Guid>.Fail("Notice of Award must be approved before creating a Purchase Order.");

                supplierId = noa.SupplierId;

                var project = await unitOfWork.ProcurementProjectRepository
                    .GetWithAwardDetailsByIdAsync(noa.ProcurementProjectId, cancellationToken);

                var cprItems = project?.ConsolidatedPRId.HasValue == true
                    ? await unitOfWork.ConsolidatedPRItemRepository.FindAllAsync(
                        ci => ci.ConsolidatedPRId == project.ConsolidatedPRId.Value,
                        cancellationToken
                    )
                    : [];

                var prItemIds = cprItems.Select(ci => ci.PRItemId).Distinct().ToList();
                var prItems = prItemIds.Count > 0
                    ? await unitOfWork.PRItemRepository.GetByIdsWithPPMPItemAsync(prItemIds, cancellationToken)
                    : [];

                purchaseOrderItems = cprItems.Select(ci =>
                {
                    var pi = prItems.FirstOrDefault(p => p.Id == ci.PRItemId);
                    var unitPrice = pi?.UnitCost > 0 ? pi.UnitCost : (project?.ABC ?? noa.AwardedAmount);
                    var qty = pi?.RequestedQuantity ?? 1;
                    var amount = pi?.Amount > 0 ? pi.Amount : (qty * unitPrice);

                    return new PurchaseOrderItem
                    {
                        SourceItemId = ci.Id,
                        Description = pi?.Name ?? project?.Title ?? "Procurement Item",
                        Quantity = qty,
                        Unit = pi?.PPMPItem?.Unit ?? "lot",
                        UnitPrice = unitPrice,
                        Amount = amount
                    };
                }).ToList();

                if (purchaseOrderItems.Count == 0 && project?.APPItemLinks != null && project.APPItemLinks.Count > 0)
                {
                    purchaseOrderItems = project.APPItemLinks
                        .OrderBy(l => l.Order)
                        .Select(l =>
                        {
                            var ppmp = l.APPItem?.PPMPItem;
                            var unitPrice = ppmp?.UnitPrice > 0 ? ppmp.UnitPrice : (project.ABC > 0 ? project.ABC : noa.AwardedAmount);
                            var qty = ppmp?.PlannedQuantity > 0 ? ppmp.PlannedQuantity : 1;
                            var amount = (l.APPItem?.EstimatedBudgetOverride.HasValue == true && l.APPItem.EstimatedBudgetOverride.Value > 0)
                                ? l.APPItem.EstimatedBudgetOverride.Value
                                : (qty * unitPrice);

                            return new PurchaseOrderItem
                            {
                                SourceItemId = l.APPItem?.Id ?? l.Id,
                                Description = ppmp?.Name ?? l.APPItem?.Remarks ?? project.Title,
                                Quantity = qty,
                                Unit = ppmp?.Unit ?? "lot",
                                UnitPrice = unitPrice,
                                Amount = amount
                            };
                        }).ToList();
                }

                if (purchaseOrderItems.Count == 0)
                {
                    purchaseOrderItems =
                    [
                        new PurchaseOrderItem
                        {
                            SourceItemId = noa.Id,
                            Description = !string.IsNullOrWhiteSpace(noa.Description) ? noa.Description : (project?.Title ?? "Awarded Procurement Package"),
                            Quantity = 1,
                            Unit = "lot",
                            UnitPrice = noa.AwardedAmount,
                            Amount = noa.AwardedAmount
                        }
                    ];
                }
                break;
            }

            case SourceDocumentTypeEnum.BAC_RESOLUTION:
            {
                var da = await unitOfWork.DirectAcquisitionRepository.GetByIdWithItemsAsync(request.SourceDocumentId, cancellationToken);

                if (da == null)
                    return ApiResponse<Guid>.Fail("Direct Acquisition record not found.");

                if (da.Status != DirectAcquisitionStatusEnum.APPROVED)
                    return ApiResponse<Guid>.Fail("Direct Acquisition record must be approved before creating a Purchase Order.");

                // Resolve supplier: from ID or create on-the-fly from RetailStoreInfo
                if (request.SupplierId.HasValue && request.SupplierId.Value != Guid.Empty)
                {
                    supplierId = request.SupplierId.Value;
                }
                else if (request.RetailStoreInfo != null && !string.IsNullOrWhiteSpace(request.RetailStoreInfo.Name))
                {
                    string storeName = request.RetailStoreInfo.Name.Trim();
                    var existing = await unitOfWork.SupplierRepository
                        .FindAsync(s => s.Name.ToLower() == storeName.ToLower(), cancellationToken);

                    if (existing != null)
                    {
                        supplierId = existing.Id;
                    }
                    else
                    {
                        var category = await unitOfWork.SupplierCategoryRepository
                            .FindAsync(c => c.Name == "Retail Store", cancellationToken);
                        if (category == null)
                        {
                            category = await unitOfWork.SupplierCategoryRepository
                                .FindAsync(c => true, cancellationToken);
                        }
                        if (category == null)
                        {
                            category = new Domain.Entities.Planning.SupplierCategory
                            {
                                Name = "Retail Store",
                                Description = "Direct Acquisition Retail Stores"
                            };
                            await unitOfWork.SupplierCategoryRepository.AddAsync(category, cancellationToken);
                            await unitOfWork.SaveChangesAsync(cancellationToken);
                        }

                        string tin = !string.IsNullOrWhiteSpace(request.RetailStoreInfo.TIN)
                            ? request.RetailStoreInfo.TIN.Trim()
                            : $"DA-TIN-{Guid.NewGuid():N}"[..15];

                        var newSupplier = new Domain.Entities.Planning.Supplier
                        {
                            Name = storeName,
                            TINNumber = tin,
                            BusinessPermitNo = $"BP-{Guid.NewGuid():N}"[..15],
                            Address = !string.IsNullOrWhiteSpace(request.RetailStoreInfo.Address) ? request.RetailStoreInfo.Address.Trim() : "Retail Store",
                            ContactPerson = "Store Representative",
                            ContactNumber = "N/A",
                            Email = $"{storeName.Replace(" ", "").ToLower()}@retail.local",
                            SupplierCategoryId = category.Id,
                            Status = nameof(SupplierStatusEnum.Approved),
                            IsBlocked = false
                        };
                        await unitOfWork.SupplierRepository.AddAsync(newSupplier, cancellationToken);
                        await unitOfWork.SaveChangesAsync(cancellationToken);
                        supplierId = newSupplier.Id;
                    }
                }
                else
                {
                    return ApiResponse<Guid>.Fail("A Supplier or Retail Store Name is required for Direct Acquisition.");
                }

                var allCprItems = da.ConsolidatedPR?.ConsolidatedPRItems ?? [];
                var filteredItems = allCprItems.AsEnumerable();
                if (!string.IsNullOrWhiteSpace(da.Remarks) && da.Remarks.StartsWith("SELECTED_ITEMS:"))
                {
                    var rawIds = da.Remarks.Substring("SELECTED_ITEMS:".Length).Split(',', StringSplitOptions.RemoveEmptyEntries);
                    var selectedSet = rawIds.Select(idStr => Guid.TryParse(idStr, out var g) ? g : Guid.Empty)
                                            .Where(g => g != Guid.Empty)
                                            .ToHashSet();

                    if (selectedSet.Count > 0)
                    {
                        filteredItems = allCprItems.Where(ci => selectedSet.Contains(ci.Id) || selectedSet.Contains(ci.PRItemId));
                    }
                }

                purchaseOrderItems = filteredItems.Select(ci => new PurchaseOrderItem
                {
                    SourceItemId = ci.Id,
                    Description = ci.PRItem?.Name ?? "Direct Acquisition Item",
                    Quantity = ci.PRItem?.RequestedQuantity ?? 1,
                    Unit = ci.PRItem?.PPMPItem?.Unit ?? "unit",
                    UnitPrice = ci.PRItem?.UnitCost ?? 0,
                    Amount = ci.PRItem?.Amount > 0 ? ci.PRItem.Amount : ((ci.PRItem?.RequestedQuantity ?? 1) * (ci.PRItem?.UnitCost ?? 0))
                }).ToList();

                if (purchaseOrderItems.Count == 0)
                {
                    purchaseOrderItems =
                    [
                        new PurchaseOrderItem
                        {
                            SourceItemId = da.Id,
                            Description = !string.IsNullOrWhiteSpace(da.DANumber) ? $"Direct Acquisition {da.DANumber}" : "Direct Acquisition Purchase",
                            Quantity = 1,
                            Unit = "lot",
                            UnitPrice = da.TotalABC,
                            Amount = da.TotalABC
                        }
                    ];
                }
                break;
            }

            default:
                return ApiResponse<Guid>.Fail("Unsupported Source Document Type.");
        }

        var purchaseOrder = new PurchaseOrder
        {
            PONumber = poNumber,
            ProcurementMode = request.ProcurementMode,
            SourceDocumentType = request.SourceDocumentType,
            SourceDocumentId = request.SourceDocumentId,
            SupplierId = supplierId,
            Description = request.Description,
            Date = request.Date,
            PlaceOfDelivery = request.PlaceOfDelivery,
            DateOfDelivery = request.DateOfDelivery,
            DeliveryTerm = request.DeliveryTerm,
            PaymentTerm = request.PaymentTerm,
            SupportingDocumentUrl = request.SupportingDocumentUrl,
            Status = StatusEnum.Draft,
            TotalAmount = purchaseOrderItems.Sum(i => i.Amount),
            PurchaseOrderItems = purchaseOrderItems
        };

        await unitOfWork.PurchaseOrderRepository.AddAsync(purchaseOrder, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(purchaseOrder.Id, "Purchase Order created successfully.");
    }
}
