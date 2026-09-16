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

        // 1. Load Linked RFQs with their items
        var rfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
            .Where(r => rfqIds.Contains(r.Id))
            .ToListAsync(cancellationToken);

        var allRfqItems = rfqs.SelectMany(r => r.RFQItems).ToList();
        var rfqItemIds = allRfqItems.Select(i => i.Id).ToList();

        // 2. Load Submitted Bids for these RFQs
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.Supplier)
            .Include(sb => sb.SupplierBidItems)
            .Where(sb => rfqIds.Contains(sb.RFQId) && !sb.IsDeleted && sb.Status != "Draft" && sb.Status != "Cancelled" && sb.Status != "Withdrawn")
            .ToListAsync(cancellationToken);

        // 3. Opening Date check
        var isBidsOpened = DateTime.UtcNow >= aob.OpeningDate;

        // Distinct Suppliers who submitted bids
        var distinctSuppliers = bids
            .GroupBy(b => b.SupplierId)
            .Select(g => g.First())
            .ToList();

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
            HasMinimumCanvassWarning = distinctSuppliers.Count < 3,
            Remarks = aob.Remarks,
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
            Suppliers = distinctSuppliers.Select(b => new AOBMatrixSupplierDto
            {
                SupplierId = b.SupplierId,
                Name = b.Supplier?.Name ?? "Unknown Supplier",
                Email = b.Supplier?.Email ?? string.Empty,
                SubmissionType = b.SubmissionType,
                SubmittedAt = b.SubmittedAt,
                DeliveryPeriod = b.DeliveryPeriod,
                ValidityPeriodDays = b.ValidityPeriodDays
            }).ToList(),
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
