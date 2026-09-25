using System.Linq;
using ERPEZ.Application.Features.Procurement.AOBs.Common;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Domain.Enums;
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
            .Include(a => a.AOBRFQMappings)
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.WinningSupplier)
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.RFQItem)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<AOBDetailResponse>.Fail("Abstract of Bids (AOB) not found.");
        }

        var rfqIds = aob.AOBRFQMappings.Select(m => m.RFQId).Distinct().ToList();
        var rfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.ConsolidatedPR)
            .Include(r => r.RFQItems)
                .ThenInclude(i => i.CPRItem)
                    .ThenInclude(ci => ci!.ConsolidatedPR)
            .Where(r => rfqIds.Contains(r.Id) && r.Status == StatusEnum.Approved)
            .ToListAsync(cancellationToken);

        var metadata = await AOBReferenceResolver.ResolveAsync(
            unitOfWork, aob.Id, aob.ApprovedBy, rfqs, cancellationToken);

        var response = new AOBDetailResponse
        {
            Id = aob.Id,
            AOBNumber = aob.AOBNumber,
            Description = aob.Description,
            AwardCriterion = aob.AwardCriterion,
            AOBDate = aob.AOBDate,
            OpeningDate = aob.OpeningDate,
            Status = aob.Status,
            SubmittedBy = aob.SubmittedBy,
            SubmittedAt = aob.SubmittedAt,
            ApprovedBy = aob.ApprovedBy,
            ApprovedAt = aob.ApprovedAt,
            SignedDocumentUrl = aob.SignedDocumentUrl,
            Remarks = aob.Remarks,
            BacResolutionNumber = metadata.BacResolutionNumber,
            PRNumber = metadata.PRNumber,
            PAPCode = metadata.PAPCode,
            ApproverName = metadata.ApproverName,
            ApproverTitle = metadata.ApproverTitle,
            RFQs = rfqs.Select(r => new AOBRFQDetailResponse
            {
                Id = r.Id,
                RFQNumber = r.RFQNumber,
                TracingNumber = r.TracingNumber,
                TotalAmount = r.TotalAmount,
                Status = r.Status,
                Date = r.Date,
                Deadline = r.Deadline
            }).ToList(),
            AwardedItems = aob.AOBAwardedItems.Select(ai => new AOBAwardedItemResponse
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
        };

        return ApiResponse<AOBDetailResponse>.Success(response);
    }
}
