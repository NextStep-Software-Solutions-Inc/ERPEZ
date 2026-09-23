using ERPEZ.Application.Features.Procurement.AOBs.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBMatrix;

public class GetAOBMatrixQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAOBMatrixQuery, ApiResponse<AOBMatrixResponse>>
{
    public async Task<ApiResponse<AOBMatrixResponse>> Handle(GetAOBMatrixQuery request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<AOBMatrixResponse>.Fail("Abstract of Bids (AOB) not found.");
        }

        var rfqIds = aob.AOBRFQMappings.Select(m => m.RFQId).ToList();

        // 1. Load Linked RFQs with their items and invited suppliers (Approved RFQs only)
        var rfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.ConsolidatedPR)
            .Include(r => r.RFQItems)
                .ThenInclude(i => i.CPRItem)
                    .ThenInclude(ci => ci!.ConsolidatedPR)
            .Include(r => r.RFQSuppliers)
                .ThenInclude(rs => rs.Supplier)
            .Where(r => rfqIds.Contains(r.Id) && r.Status == StatusEnum.Approved)
            .ToListAsync(cancellationToken);

        var approvedRfqIds = rfqs.Select(r => r.Id).ToList();
        var allRfqItems = rfqs.SelectMany(r => r.RFQItems).ToList();
        var rfqItemIds = allRfqItems.Select(i => i.Id).ToList();

        // 2. Load Submitted Bids for these RFQs
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.Supplier)
            .Include(sb => sb.SupplierBidItems)
            .Where(sb => approvedRfqIds.Contains(sb.RFQId) && !sb.IsDeleted && sb.Status != "Draft" && sb.Status != "Cancelled" && sb.Status != "Withdrawn")
            .ToListAsync(cancellationToken);

        // 3. Opening Date check
        var isBidsOpened = DateTime.UtcNow >= aob.OpeningDate;

        // Map submitted bids by SupplierId
        var submittedBidsBySupplier = bids
            .GroupBy(b => b.SupplierId)
            .ToDictionary(g => g.Key, g => g.First());

        // Map invited suppliers from linked RFQs
        var invitedSuppliersBySupplier = rfqs
            .SelectMany(r => (r.RFQSuppliers ?? []).Select(rs => new { RFQ = r, RFQSupplier = rs }))
            .Where(x => !x.RFQSupplier.IsDeleted && x.RFQSupplier.Supplier != null)
            .GroupBy(x => x.RFQSupplier.SupplierId)
            .ToDictionary(g => g.Key, g => g.First());

        // Combine all distinct suppliers (submitted + invited)
        var allSupplierIds = submittedBidsBySupplier.Keys
            .Union(invitedSuppliersBySupplier.Keys)
            .ToList();

        var matrixSuppliers = new List<AOBMatrixSupplierDto>();
        foreach (var supplierId in allSupplierIds)
        {
            if (submittedBidsBySupplier.TryGetValue(supplierId, out var bid))
            {
                var rfq = rfqs.FirstOrDefault(r => r.Id == bid.RFQId);
                matrixSuppliers.Add(new AOBMatrixSupplierDto
                {
                    SupplierId = bid.SupplierId,
                    Name = bid.Supplier?.Name ?? "Unknown Supplier",
                    Email = bid.Supplier?.Email ?? string.Empty,
                    ContactPerson = bid.Supplier?.ContactPerson,
                    ContactNumber = bid.Supplier?.ContactNumber,
                    Address = bid.Supplier?.Address,
                    TINNumber = bid.Supplier?.TINNumber,
                    PhilGEPSNumber = bid.Supplier?.PhilGEPSNumber,
                    SubmissionType = bid.SubmissionType,
                    SubmittedAt = bid.SubmittedAt,
                    DeliveryPeriod = bid.DeliveryPeriod,
                    ValidityPeriodDays = bid.ValidityPeriodDays,
                    PaymentTerms = bid.PaymentTerms,
                    WarrantyTerms = bid.WarrantyTerms,
                    TotalBidAmount = bid.TotalAmount,
                    Remarks = bid.Remarks,
                    HasSubmitted = true,
                    RFQNumber = rfq?.RFQNumber,
                    RFQId = bid.RFQId,
                    QuotationDocumentUrl = bid.QuotationDocumentUrl,
                    SignatureUrl = bid.SignatureUrl,
                    SignatoryName = bid.SignatoryName,
                    DateSigned = bid.DateSigned
                });
            }
            else if (invitedSuppliersBySupplier.TryGetValue(supplierId, out var invited))
            {
                var supplier = invited.RFQSupplier.Supplier;
                matrixSuppliers.Add(new AOBMatrixSupplierDto
                {
                    SupplierId = invited.RFQSupplier.SupplierId,
                    Name = supplier?.Name ?? "Unknown Supplier",
                    Email = supplier?.Email ?? string.Empty,
                    ContactPerson = supplier?.ContactPerson,
                    ContactNumber = supplier?.ContactNumber,
                    Address = supplier?.Address,
                    TINNumber = supplier?.TINNumber,
                    PhilGEPSNumber = supplier?.PhilGEPSNumber,
                    SubmissionType = null,
                    SubmittedAt = null,
                    DeliveryPeriod = null,
                    ValidityPeriodDays = null,
                    PaymentTerms = null,
                    WarrantyTerms = null,
                    TotalBidAmount = 0,
                    Remarks = "Invited - Did not submit quotation",
                    HasSubmitted = false,
                    RFQNumber = invited.RFQ.RFQNumber,
                    RFQId = invited.RFQ.Id,
                    QuotationDocumentUrl = null,
                    SignatureUrl = null,
                    SignatoryName = null,
                    DateSigned = null
                });
            }
        }

        var metadata = await AOBReferenceResolver.ResolveAsync(
            unitOfWork, aob.Id, aob.ApprovedBy, rfqs, cancellationToken);

        var response = new AOBMatrixResponse
        {
            AOBId = aob.Id,
            AOBNumber = aob.AOBNumber,
            Description = aob.Description,
            AwardCriterion = aob.AwardCriterion,
            Status = aob.Status,
            AOBDate = aob.AOBDate,
            OpeningDate = aob.OpeningDate,
            IsBidsOpened = isBidsOpened,
            HasMinimumCanvassWarning = submittedBidsBySupplier.Count < 3,
            Remarks = aob.Remarks,
            BacResolutionNumber = metadata.BacResolutionNumber,
            PRNumber = metadata.PRNumber,
            PAPCode = metadata.PAPCode,
            ApproverName = metadata.ApproverName,
            ApproverTitle = metadata.ApproverTitle,
            LinkedRFQs = rfqs.Select(r => new AOBMatrixRFQDto
            {
                Id = r.Id,
                RFQNumber = r.RFQNumber,
                TracingNumber = r.TracingNumber,
                TotalAmount = r.TotalAmount,
                Status = r.Status,
                Date = r.Date,
                Deadline = r.Deadline
            }).ToList(),
            Suppliers = matrixSuppliers,
            Items = allRfqItems.Select(item => new AOBMatrixItemDto
            {
                RFQItemId = item.Id,
                RFQId = item.RFQId,
                Name = item.ItemNameSnapshot,
                Category = item.CategorySnapshot,
                FundSource = item.FundSnapshot,
                ABCUnitPrice = item.UnitPriceSnapshot,
                Quantity = item.Quantity,
                TotalABC = item.Quantity * item.UnitPriceSnapshot,
                IsBrochureRequired = item.IsBrochureRequired,
                GreenSpecification = item.GreenSpecification
            }).ToList()
        };

        // 4. Map and rank bids per line item
        var cellDtos = new List<AOBMatrixBidCellDto>();

        foreach (var itemDto in response.Items)
        {
            var itemBids = new List<AOBMatrixBidCellDto>();

            foreach (var bid in bids)
            {
                var bidItem = bid.SupplierBidItems.FirstOrDefault(bi => bi.RFQItemId == itemDto.RFQItemId);
                if (bidItem != null)
                {
                    var isOverABC = bidItem.UnitPrice > itemDto.ABCUnitPrice;

                    itemBids.Add(new AOBMatrixBidCellDto
                    {
                        BidItemId = bidItem.Id,
                        SupplierId = bid.SupplierId,
                        SupplierName = bid.Supplier?.Name ?? string.Empty,
                        RFQItemId = itemDto.RFQItemId,
                        UnitPrice = isBidsOpened ? bidItem.UnitPrice : 0,
                        TotalPrice = isBidsOpened ? (bidItem.UnitPrice * itemDto.Quantity) : 0,
                        Brand = isBidsOpened ? bidItem.Brand : null,
                        Model = isBidsOpened ? bidItem.Model : null,
                        Color = isBidsOpened ? bidItem.Color : null,
                        BrochureFileId = isBidsOpened ? bidItem.BrochureFileId : null,
                        BrochureFileUrl = isBidsOpened ? bidItem.BrochureFileUrl : null,
                        IsResponsive = bidItem.IsResponsive && !string.Equals(bid.Status, "Failed", StringComparison.OrdinalIgnoreCase) && !string.Equals(bid.Status, "Disqualified", StringComparison.OrdinalIgnoreCase),
                        DisqualificationReason = string.Equals(bid.Status, "Failed", StringComparison.OrdinalIgnoreCase)
                            ? (bid.Remarks ?? "Failed BAC evaluation")
                            : bidItem.DisqualificationReason,
                        IsOverABC = isOverABC,
                        QualityScore = isBidsOpened ? bidItem.QualityScore : null,
                        Rank = 0,
                        Score = 0
                    });
                }
            }

            // Rank and Score eligible bids if bids are opened
            if (isBidsOpened)
            {
                var eligibleBids = itemBids
                    .Where(b => b.IsResponsive && !b.IsOverABC && b.UnitPrice > 0)
                    .OrderBy(b => b.UnitPrice)
                    .ToList();

                if (eligibleBids.Count > 0)
                {
                    var lowestPrice = eligibleBids.First().UnitPrice;

                    for (int i = 0; i < eligibleBids.Count; i++)
                    {
                        var eligibleBid = eligibleBids[i];
                        eligibleBid.Rank = i + 1;

                        if (aob.AwardCriterion == BidEvaluationCriteria.LCRB)
                        {
                            // LCRB Score: (Lowest Price / Supplier Price) * 100
                            eligibleBid.Score = Math.Round((lowestPrice / eligibleBid.UnitPrice) * 100, 2);
                        }
                        else if (aob.AwardCriterion == BidEvaluationCriteria.MEARB)
                        {
                            // MEARB: Weighted Price (60%) + Quality Score (40%) if present, else standard ratio
                            var priceScore = (lowestPrice / eligibleBid.UnitPrice) * 60;
                            var qualityScore = (eligibleBid.QualityScore ?? 100) * 0.4m;
                            eligibleBid.Score = Math.Round(priceScore + qualityScore, 2);
                        }
                        else
                        {
                            eligibleBid.Score = Math.Round((lowestPrice / eligibleBid.UnitPrice) * 100, 2);
                        }
                    }
                }
            }

            cellDtos.AddRange(itemBids);
        }

        response.Bids = cellDtos;

        return ApiResponse<AOBMatrixResponse>.Success(response);
    }
}
