using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetSupplierDirectContractingById;

public class GetSupplierDirectContractingByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierDirectContractingByIdQuery, ApiResponse<DirectContractingResponse>>
{
    public async Task<ApiResponse<DirectContractingResponse>> Handle(GetSupplierDirectContractingByIdQuery request, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PurchaseRequest)
                            .ThenInclude(pr => pr.Office)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItemLinks)
                    .ThenInclude(l => l.APPItem)
                        .ThenInclude(ai => ai.PPMPItem)
                            .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItemLinks)
                    .ThenInclude(l => l.APPItem)
                        .ThenInclude(ai => ai.Office)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.PPMPItem)
                        .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(dc => dc.BACProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.Office)
            .Include(dc => dc.ExclusiveSupplier)
            .Include(dc => dc.Proposal)
                .ThenInclude(p => p!.ProposalItems)
                    .ThenInclude(pi => pi.CPRItem)
                        .ThenInclude(cpr => cpr.PPMPItemAllocations)
            .Where(dc => dc.Id == request.Id 
                         && (request.SupplierId == Guid.Empty || dc.ExclusiveSupplierId == request.SupplierId) 
                         && !dc.IsDeleted 
                         && dc.Status != DirectContractingStatusEnum.DRAFT)
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);

        if (dc == null)
        {
            return ApiResponse<DirectContractingResponse>.Fail("Direct Contracting invitation not found for this supplier.");
        }

        var items = new List<DirectContractingItemResponse>();

        if (dc.BACProject != null)
        {
            if (dc.BACProject.SourceType == ProcurementProjectSourceType.ConsolidatedPR && dc.BACProject.ConsolidatedPR != null)
            {
                foreach (var cprItem in dc.BACProject.ConsolidatedPR.ConsolidatedPRItems.Where(ci => !ci.IsDeleted))
                {
                    var prItem = cprItem.PRItem;
                    if (prItem == null || prItem.IsDeleted) continue;

                    var ppmpItem = prItem.PPMPItem;
                    int quantity = prItem.RequestedQuantity;
                    decimal unitPrice = prItem.UnitCost;
                    decimal totalAmount = prItem.Amount > 0 ? prItem.Amount : (quantity * unitPrice);

                    var canonicalId = prItem.PPMPItemId ?? cprItem.Id;

                    items.Add(new DirectContractingItemResponse
                    {
                        Id = canonicalId,
                        CPRItemId = canonicalId,
                        SourceItemId = cprItem.Id,
                        ItemName = prItem.Name,
                        Description = prItem.Description ?? ppmpItem?.Description,
                        Unit = ppmpItem?.Unit ?? "unit",
                        Quantity = quantity,
                        UnitABC = unitPrice,
                        TotalABC = totalAmount,
                        Office = cprItem.PurchaseRequest?.Office?.Name ?? string.Empty,
                        PRNumber = cprItem.PurchaseRequest?.PRNumber,
                        PAPCode = ppmpItem?.PAPCode,
                        Category = ppmpItem?.ProjectType.ToString() ?? (prItem.IsNonCSE ? "Non-CSE" : "CSE"),
                        SourceType = "ConsolidatedPR"
                    });
                }
            }
            else if (dc.BACProject.SourceType == ProcurementProjectSourceType.APPItem)
            {
                var appItemList = new List<APPItem>();
                if (dc.BACProject.APPItemLinks != null && dc.BACProject.APPItemLinks.Count > 0)
                {
                    appItemList.AddRange(dc.BACProject.APPItemLinks
                        .Where(l => !l.IsDeleted && l.APPItem != null && !l.APPItem.IsDeleted)
                        .OrderBy(l => l.Order)
                        .Select(l => l.APPItem));
                }
                else if (dc.BACProject.APPItem != null && !dc.BACProject.APPItem.IsDeleted)
                {
                    appItemList.Add(dc.BACProject.APPItem);
                }

                foreach (var appItem in appItemList)
                {
                    var ppmpItem = appItem.PPMPItem;
                    int quantity = 1;
                    if (ppmpItem != null)
                    {
                        var allocSum = ppmpItem.PPMPItemAllocations != null && ppmpItem.PPMPItemAllocations.Any(a => !a.IsDeleted)
                            ? ppmpItem.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity)
                            : 0;
                        quantity = allocSum > 0 ? allocSum : (ppmpItem.PlannedQuantity > 0 ? ppmpItem.PlannedQuantity : 1);
                    }

                    decimal totalABC = appItem.EffectiveABC;
                    decimal unitABC = quantity > 0 ? (totalABC / quantity) : totalABC;
                    var canonicalId = appItem.PPMPItemId != Guid.Empty ? appItem.PPMPItemId : appItem.Id;

                    items.Add(new DirectContractingItemResponse
                    {
                        Id = canonicalId,
                        CPRItemId = canonicalId,
                        SourceItemId = appItem.Id,
                        ItemName = !string.IsNullOrWhiteSpace(appItem.ItemNameOverride) ? appItem.ItemNameOverride : (ppmpItem?.Name ?? appItem.Remarks ?? "APP Item"),
                        Description = appItem.GeneralDescription ?? ppmpItem?.Description,
                        Unit = ppmpItem?.Unit ?? "unit",
                        Quantity = quantity,
                        UnitABC = unitABC,
                        TotalABC = totalABC,
                        Office = appItem.Office?.Name ?? string.Empty,
                        PRNumber = null,
                        PAPCode = !string.IsNullOrWhiteSpace(appItem.PAPCode) ? appItem.PAPCode : ppmpItem?.PAPCode,
                        Category = ppmpItem?.ProjectType.ToString() ?? "APP",
                        SourceType = "APPItem"
                    });
                }
            }
        }

        var response = new DirectContractingResponse
        {
            Id = dc.Id,
            DCNumber = dc.DCNumber,
            Name = dc.Name,
            BACProjectId = dc.BACProjectId,
            BACProjectTitle = dc.BACProject != null ? dc.BACProject.Title : string.Empty,
            BACProjectABC = dc.BACProject != null ? dc.BACProject.ABC : 0,
            BACProjectStatus = dc.BACProject != null ? dc.BACProject.Status : string.Empty,
            ExclusiveSupplierId = dc.ExclusiveSupplierId,
            ExclusiveSupplierName = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Name : string.Empty,
            ExclusiveSupplierEmail = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Email : string.Empty,
            ExclusiveSupplierContact = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.ContactNumber : string.Empty,
            ExclusiveSupplierPhilGEPS = dc.ExclusiveSupplier != null ? (dc.ExclusiveSupplier.PhilGEPSNumber ?? string.Empty) : string.Empty,
            SubmissionDeadline = dc.SubmissionDeadline,
            Status = dc.Status.ToString(),
            TotalABC = dc.TotalABC,
            ReviewRemarks = dc.ReviewRemarks,
            CreatedByUserId = dc.CreatedByUserId,
            ReviewedByUserId = dc.ReviewedByUserId,
            CreatedAt = dc.CreatedAt,
            CreatedBy = dc.CreatedBy,
            ApprovedAttachment = dc.ApprovedFileId.HasValue ? new ApprovedAttachmentResponse
            {
                FileId = dc.ApprovedFileId.Value
            } : null,
            Proposal = dc.Proposal != null ? new DirectContractingProposalResponse
            {
                Id = dc.Proposal.Id,
                DirectContractingId = dc.Proposal.DirectContractingId,
                SupplierId = dc.Proposal.SupplierId,
                SupplierName = dc.ExclusiveSupplier != null ? dc.ExclusiveSupplier.Name : string.Empty,
                ExclusivityDocumentUrl = dc.Proposal.ExclusivityDocumentUrl,
                ProposalRemarks = dc.Proposal.ProposalRemarks,
                TotalProposalAmount = dc.Proposal.TotalProposalAmount,
                SubmittedAt = dc.Proposal.SubmittedAt,
                ProposalItems = dc.Proposal.ProposalItems.Select(item =>
                {
                    var matchedReqItem = items.FirstOrDefault(i => i.CPRItemId == item.CPRItemId || i.Id == item.CPRItemId);
                    var itemName = !string.IsNullOrWhiteSpace(item.CPRItem?.Name)
                        ? item.CPRItem.Name
                        : (matchedReqItem?.ItemName ?? string.Empty);

                    int qty = matchedReqItem != null && matchedReqItem.Quantity > 0
                        ? matchedReqItem.Quantity
                        : (item.CPRItem != null
                            ? (item.CPRItem.PlannedQuantity > 0
                                ? item.CPRItem.PlannedQuantity
                                : (item.CPRItem.PPMPItemAllocations != null && item.CPRItem.PPMPItemAllocations.Count > 0
                                    ? item.CPRItem.PPMPItemAllocations.Sum(a => a.Quantity)
                                    : 1))
                            : 1);

                    decimal unitAbc = matchedReqItem != null && matchedReqItem.UnitABC > 0
                        ? matchedReqItem.UnitABC
                        : (item.CPRItem != null ? item.CPRItem.UnitPrice : 0);

                    decimal totalAbc = matchedReqItem != null && matchedReqItem.TotalABC > 0
                        ? matchedReqItem.TotalABC
                        : (unitAbc * qty);

                    return new DirectContractingProposalItemResponse
                    {
                        Id = item.Id,
                        ProposalId = item.ProposalId,
                        CPRItemId = item.CPRItemId,
                        CPRItemName = itemName,
                        Quantity = qty,
                        UnitABC = unitAbc,
                        TotalABC = totalAbc,
                        UnitBid = item.UnitBid,
                        TotalBid = item.TotalBid,
                        Brand = item.Brand,
                        Model = item.Model,
                        Color = item.Color,
                        BrochureFileUrl = item.BrochureFileUrl
                    };
                }).ToList()
            } : null,
            Items = items
        };

        return ApiResponse<DirectContractingResponse>.Success(response);
    }
}
