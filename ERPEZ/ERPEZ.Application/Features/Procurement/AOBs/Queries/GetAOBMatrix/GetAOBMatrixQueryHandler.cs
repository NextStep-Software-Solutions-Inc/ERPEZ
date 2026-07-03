using ERPEZ.Domain.Entities.Planning;
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
            .Include(a => a.AOBProcurementProjectMappings)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<AOBMatrixResponse>.Fail("Abstract of Bids (AOB) not found.");
        }

        var projectIds = aob.AOBProcurementProjectMappings.Select(m => m.ProcurementProjectId).ToList();

        // Load Projects
        var projects = await unitOfWork.ProcurementProjectRepository.Query()
            .Where(p => projectIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        // Load Submitted Bids
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.Supplier)
            .Include(sb => sb.SupplierBidItems)
            .Where(sb => projectIds.Contains(sb.ProcurementProjectId) && sb.Status == "SUBMITTED")
            .ToListAsync(cancellationToken);

        // Get distinct APPItemIds from all bids
        var appItemIds = bids.SelectMany(b => b.SupplierBidItems).Select(bi => bi.APPItemId).Distinct().ToList();

        // Load APPItems
        var appItems = await unitOfWork.APPItemRepository.Query()
            .Include(ai => ai.PPMPItem)
                .ThenInclude(pi => pi.PPMPItemAllocations)
            .Where(ai => appItemIds.Contains(ai.Id))
            .ToListAsync(cancellationToken);

        var response = new AOBMatrixResponse
        {
            AOBId = aob.Id,
            AOBNumber = aob.AOBNumber,
            Description = aob.Description,
            AwardCriterion = aob.AwardCriterion,
            Status = aob.Status,
            AOBDate = aob.AOBDate,
            OpeningDate = aob.OpeningDate,
            LinkedProjects = projects.Select(p => new AOBProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                ABC = p.ABC,
                Status = p.Status
            }).ToList()
        };

        // Distinct Suppliers who submitted bids
        var suppliersList = bids.Select(b => b.Supplier)
            .GroupBy(s => s.Id)
            .Select(g => g.First())
            .ToList();

        response.Suppliers = suppliersList.Select(s => new AOBMatrixSupplierDto
        {
            SupplierId = s.Id,
            Name = s.Name,
            Email = s.Email
        }).ToList();

        // Map items
        var itemDtos = new List<AOBMatrixItemDto>();
        foreach (var appItem in appItems)
        {
            var ppmpItem = appItem.PPMPItem;
            var totalQty = ppmpItem?.PPMPItemAllocations.Sum(a => a.Quantity) ?? 0;
            if (totalQty == 0) totalQty = 1;

            var abcUnitPrice = ppmpItem?.UnitPrice ?? 0;

            itemDtos.Add(new AOBMatrixItemDto
            {
                APPItemId = appItem.Id,
                Name = ppmpItem?.Name ?? "Unknown Item",
                Description = ppmpItem?.Description,
                PAPCode = appItem.PAPCode,
                ABCUnitPrice = abcUnitPrice,
                TotalQuantity = totalQty,
                TotalABC = totalQty * abcUnitPrice
            });
        }
        response.Items = itemDtos;

        // Map and rank bids
        var cellDtos = new List<AOBMatrixBidCellDto>();

        foreach (var itemDto in response.Items)
        {
            var itemBids = new List<AOBMatrixBidCellDto>();

            // Collect bids for this item
            foreach (var bid in bids)
            {
                var bidItem = bid.SupplierBidItems.FirstOrDefault(bi => bi.APPItemId == itemDto.APPItemId);
                if (bidItem != null)
                {
                    var isOverABC = bidItem.UnitPrice > itemDto.ABCUnitPrice;

                    itemBids.Add(new AOBMatrixBidCellDto
                    {
                        BidItemId = bidItem.Id,
                        SupplierId = bid.SupplierId,
                        APPItemId = itemDto.APPItemId,
                        UnitPrice = bidItem.UnitPrice,
                        Brand = bidItem.Brand,
                        Model = bidItem.Model,
                        Color = bidItem.Color,
                        BrochureFileUrl = bidItem.BrochureFileUrl,
                        IsResponsive = bidItem.IsResponsive,
                        IsOverABC = isOverABC,
                        Rank = 0,
                        Score = 0
                    });
                }
            }

            // Rank and Score the responsive, not-over-ABC bids for this item
            var eligibleBids = itemBids
                .Where(b => b.IsResponsive && !b.IsOverABC)
                .OrderBy(b => b.UnitPrice)
                .ToList();

            if (eligibleBids.Count > 0)
            {
                var lowestPrice = eligibleBids.First().UnitPrice;

                for (int i = 0; i < eligibleBids.Count; i++)
                {
                    var eligibleBid = eligibleBids[i];
                    eligibleBid.Rank = i + 1;

                    // Score calculation: (Lowest Price / Supplier Price) * 100
                    if (eligibleBid.UnitPrice > 0)
                    {
                        eligibleBid.Score = Math.Round((lowestPrice / eligibleBid.UnitPrice) * 100, 2);
                    }
                    else
                    {
                        eligibleBid.Score = 0;
                    }
                }
            }

            // Add all (both eligible and ineligible) back to cells list
            cellDtos.AddRange(itemBids);
        }

        response.Bids = cellDtos;

        return ApiResponse<AOBMatrixResponse>.Success(response);
    }
}
