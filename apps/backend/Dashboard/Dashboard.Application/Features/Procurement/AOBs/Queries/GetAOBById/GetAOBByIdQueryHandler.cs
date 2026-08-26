using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;

public class GetAOBByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAOBByIdQuery, ApiResponse<AOBDetailResponse>>
{
    public async Task<ApiResponse<AOBDetailResponse>> Handle(GetAOBByIdQuery request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Where(a => a.Id == request.Id && !a.IsDeleted)
            .Select(a => new AOBDetailResponse
            {
                Id = a.Id,
                AOBNumber = a.AOBNumber,
                Description = a.Description,
                AwardCriterion = a.AwardCriterion,
                AOBDate = a.AOBDate,
                OpeningDate = a.OpeningDate,
                Status = a.Status,
                SubmittedBy = a.SubmittedBy,
                SubmittedAt = a.SubmittedAt,
                ApprovedBy = a.ApprovedBy,
                ApprovedAt = a.ApprovedAt,
                SignedDocumentUrl = a.SignedDocumentUrl,
                Remarks = a.Remarks,
                RFQs = a.AOBRFQMappings
                    .Where(m => m.RFQ != null)
                    .Select(m => new AOBRFQDetailResponse
                    {
                        Id = m.RFQId,
                        RFQNumber = m.RFQ.RFQNumber,
                        TracingNumber = m.RFQ.TracingNumber,
                        TotalAmount = m.RFQ.TotalAmount,
                        Status = m.RFQ.Status,
                        Date = m.RFQ.Date,
                        Deadline = m.RFQ.Deadline
                    }).ToList(),
                AwardedItems = a.AOBAwardedItems.Select(ai => new AOBAwardedItemResponse
                {
                    Id = ai.Id,
                    RFQItemId = ai.RFQItemId,
                    ItemName = ai.RFQItem != null ? ai.RFQItem.ItemNameSnapshot : string.Empty,
                    WinningSupplierId = ai.WinningSupplierId,
                    WinningSupplierName = ai.WinningSupplier != null ? ai.WinningSupplier.Name : string.Empty,
                    AwardedUnitPrice = ai.AwardedUnitPrice,
                    AwardedQuantity = ai.AwardedQuantity,
                    TotalAwardedAmount = ai.TotalAwardedAmount,
                    Score = ai.Score,
                    AwardReason = ai.AwardReason,
                    PurchaseOrderId = ai.PurchaseOrderId
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (aob == null)
        {
            return ApiResponse<AOBDetailResponse>.Fail("Abstract of Bids (AOB) not found.");
        }

        return ApiResponse<AOBDetailResponse>.Success(aob);
    }
}
