using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingSummary;

public class GetDirectContractingSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDirectContractingSummaryQuery, ApiResponse<DirectContractingSummaryDto>>
{
    public async Task<ApiResponse<DirectContractingSummaryDto>> Handle(
        GetDirectContractingSummaryQuery request,
        CancellationToken cancellationToken)
    {
        var counts = await unitOfWork.DirectContractingRepository.Query()
            .Where(dc => !dc.IsDeleted)
            .GroupBy(dc => dc.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        int GetCount(DirectContractingStatusEnum status) =>
            counts.FirstOrDefault(c => c.Status == status)?.Count ?? 0;

        var summary = new DirectContractingSummaryDto
        {
            Total = counts.Sum(c => c.Count),
            Draft = GetCount(DirectContractingStatusEnum.DRAFT),
            ForReview = GetCount(DirectContractingStatusEnum.FOR_REVIEW),
            SubmittedToSupplier = GetCount(DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER),
            PendingForApproval = GetCount(DirectContractingStatusEnum.PENDING_FOR_APPROVAL),
            Approved = GetCount(DirectContractingStatusEnum.APPROVED),
            Returned = GetCount(DirectContractingStatusEnum.RETURNED)
        };

        return ApiResponse<DirectContractingSummaryDto>.Success(summary);
    }
}
