using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQInvitations;

public record GetSupplierRFQInvitationsQuery(Guid SupplierId) : IRequest<ApiResponse<List<SupplierRFQDto>>>;

public class GetSupplierRFQInvitationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierRFQInvitationsQuery, ApiResponse<List<SupplierRFQDto>>>
{
    public async Task<ApiResponse<List<SupplierRFQDto>>> Handle(GetSupplierRFQInvitationsQuery request, CancellationToken cancellationToken)
    {
        // Fetch RFQs where this supplier is invited
        var invitedRfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
            .Include(r => r.RFQSuppliers)
            .Where(r => !r.IsDeleted && r.RFQSuppliers.Any(s => s.SupplierId == request.SupplierId))
            .ToListAsync(cancellationToken);

        var rfqIds = invitedRfqs.Select(r => r.Id).ToList();

        var supplierBids = await unitOfWork.SupplierBidRepository.Query()
            .Where(b => rfqIds.Contains(b.RFQId) && b.SupplierId == request.SupplierId && !b.IsDeleted)
            .ToDictionaryAsync(b => b.RFQId, cancellationToken);

        var result = invitedRfqs.Select(rfq =>
        {
            var invitation = rfq.RFQSuppliers.First(s => s.SupplierId == request.SupplierId);
            supplierBids.TryGetValue(rfq.Id, out var existingBid);

            return new SupplierRFQDto
            {
                Id = rfq.Id,
                RFQNumber = rfq.RFQNumber,
                TracingNumber = rfq.TracingNumber,
                Description = rfq.Description,
                Purpose = rfq.Purpose,
                DeliveryPeriod = rfq.DeliveryPeriod,
                Date = rfq.Date,
                Deadline = rfq.Deadline,
                TotalAmount = rfq.TotalAmount,
                Status = rfq.Status,
                InvitedAt = invitation.InvitedAt,
                HasSubmittedBid = existingBid != null && string.Equals(existingBid.Status, "SUBMITTED", StringComparison.OrdinalIgnoreCase),
                BidStatus = existingBid?.Status,
                Items = rfq.RFQItems.Select(i => new SupplierRFQItemDto
                {
                    Id = i.Id,
                    RFQId = i.RFQId,
                    ItemName = i.ItemNameSnapshot,
                    Category = i.CategorySnapshot,
                    Quantity = i.Quantity,
                    UnitPriceSnapshot = i.UnitPriceSnapshot,
                    TotalABC = i.Quantity * i.UnitPriceSnapshot,
                    IsBrochureRequired = i.IsBrochureRequired,
                    GreenSpecification = i.GreenSpecification
                }).ToList()
            };
        }).ToList();

        return ApiResponse<List<SupplierRFQDto>>.Success(result);
    }
}
