using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQById;

public class GetRFQByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQByIdQuery, ApiResponse<RFQDetailDto>>
{
    public async Task<ApiResponse<RFQDetailDto>> Handle(GetRFQByIdQuery request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("RFQ not found.");

        return ApiResponse<RFQDetailDto>.Success(new RFQDetailDto
        {
            Id = rfq.Id,
            RFQNumber = rfq.RFQNumber,
            TracingNumber = rfq.TracingNumber,
            Description = rfq.Description,
            ModeOfProcurementId = rfq.ModeOfProcurementId,
            ModeOfProcurementName = rfq.ModeOfProcurement?.Name,
            Date = rfq.Date,
            Deadline = rfq.Deadline,
            DeliveryPeriod = rfq.DeliveryPeriod,
            Purpose = rfq.Purpose,
            Status = rfq.Status,
            TotalAmount = rfq.TotalAmount,
            Items = rfq.RFQItems.Select(item => new RFQItemDto
            {
                Id = item.Id,
                CPRItemId = item.CPRItemId,
                ItemNameSnapshot = item.ItemNameSnapshot,
                Quantity = item.Quantity,
                UnitPriceSnapshot = item.UnitPriceSnapshot,
                IsBrochureRequired = item.IsBrochureRequired,
                GreenSpecification = item.GreenSpecification,
                CategorySnapshot = item.CategorySnapshot,
                FundSnapshot = item.FundSnapshot
            }).ToList(),
            Suppliers = rfq.RFQSuppliers.Select(s => new RFQSupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.Supplier?.Name ?? string.Empty,
                InvitedAt = s.InvitedAt
            }).ToList()
        }, "RFQ retrieved successfully.");
    }
}
