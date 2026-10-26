using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetSupplierBid;

public record GetSupplierBidQuery(Guid RFQId, Guid SupplierId) : IRequest<ApiResponse<SupplierBidDetailDto>>;

public class GetSupplierBidQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierBidQuery, ApiResponse<SupplierBidDetailDto>>
{
    public async Task<ApiResponse<SupplierBidDetailDto>> Handle(GetSupplierBidQuery request, CancellationToken cancellationToken)
    {
        var bid = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.SupplierBidItems)
                .ThenInclude(i => i.RFQItem)
            .FirstOrDefaultAsync(b => b.RFQId == request.RFQId && b.SupplierId == request.SupplierId && !b.IsDeleted, cancellationToken);

        if (bid == null)
        {
            return ApiResponse<SupplierBidDetailDto>.Fail("Supplier bid not found for the specified RFQ.");
        }

        var dto = new SupplierBidDetailDto
        {
            Id = bid.Id,
            RFQId = bid.RFQId,
            SupplierId = bid.SupplierId,
            SubmissionType = bid.SubmissionType,
            Status = bid.Status,
            ValidityPeriodDays = bid.ValidityPeriodDays,
            DeliveryPeriod = bid.DeliveryPeriod,
            PaymentTerms = bid.PaymentTerms,
            WarrantyTerms = bid.WarrantyTerms,
            TotalAmount = bid.TotalAmount,
            SubmittedAt = bid.SubmittedAt,
            Remarks = bid.Remarks,
            QuotationDocumentUrl = bid.QuotationDocumentUrl,
            SignatureUrl = bid.SignatureUrl,
            SignatoryName = bid.SignatoryName,
            DateSigned = bid.DateSigned,
            Items = bid.SupplierBidItems.Select(i => new SupplierBidItemDetailDto
            {
                Id = i.Id,
                RFQItemId = i.RFQItemId,
                ItemName = i.RFQItem?.ItemNameSnapshot ?? "Unknown Item",
                Quantity = i.RFQItem?.Quantity ?? 1,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                Brand = i.Brand,
                Model = i.Model,
                Color = i.Color,
                BrochureFileId = i.BrochureFileId,
                BrochureFileUrl = i.BrochureFileUrl,
                IsResponsive = i.IsResponsive,
                DisqualificationReason = i.DisqualificationReason,
                QualityScore = i.QualityScore
            }).ToList()
        };

        return ApiResponse<SupplierBidDetailDto>.Success(dto);
    }
}
