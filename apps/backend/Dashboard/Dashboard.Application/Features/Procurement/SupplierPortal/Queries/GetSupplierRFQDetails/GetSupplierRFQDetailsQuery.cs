using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierRFQDetails;

public record GetSupplierRFQDetailsQuery(Guid RFQId, Guid SupplierId) : IRequest<ApiResponse<SupplierRFQDto>>;

public class GetSupplierRFQDetailsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierRFQDetailsQuery, ApiResponse<SupplierRFQDto>>
{
    public async Task<ApiResponse<SupplierRFQDto>> Handle(GetSupplierRFQDetailsQuery request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
                .ThenInclude(i => i.CPRItem)
                    .ThenInclude(c => c.PRItem)
            .Include(r => r.RFQSuppliers)
            .FirstOrDefaultAsync(r => r.Id == request.RFQId && !r.IsDeleted, cancellationToken);

        if (rfq == null)
        {
            return ApiResponse<SupplierRFQDto>.Fail("Request for Quotation (RFQ) not found.");
        }

        if (rfq.Status != StatusEnum.Approved)
        {
            return ApiResponse<SupplierRFQDto>.Fail("This RFQ is not approved or open for quotations.");
        }

        var invitation = rfq.RFQSuppliers.FirstOrDefault(s => s.SupplierId == request.SupplierId);
        if (invitation == null)
        {
            return ApiResponse<SupplierRFQDto>.Fail("Supplier has not been invited to this RFQ.");
        }

        var existingBid = await unitOfWork.SupplierBidRepository.Query()
            .FirstOrDefaultAsync(b => b.RFQId == request.RFQId && b.SupplierId == request.SupplierId && !b.IsDeleted, cancellationToken);

        var dto = new SupplierRFQDto
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
                Fund = i.FundSnapshot,
                Quantity = i.Quantity,
                UnitPriceSnapshot = i.UnitPriceSnapshot,
                TotalABC = i.Quantity * i.UnitPriceSnapshot,
                IsBrochureRequired = i.IsBrochureRequired,
                GreenSpecification = i.GreenSpecification,
                Month = i.CPRItem?.PRItem?.RequestedMonth.ToString(),
                MonthlyAllocations = i.CPRItem?.PRItem != null
                    ? new List<MonthlyAllocationDto> { new(i.CPRItem.PRItem.RequestedMonth.ToString(), i.Quantity) }
                    : new List<MonthlyAllocationDto>()
            }).ToList()
        };

        return ApiResponse<SupplierRFQDto>.Success(dto);
    }
}
