using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedSummary;

public class GetNoticeToProceedSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNoticeToProceedSummaryQuery, ApiResponse<NoticeToProceedSummaryDto>>
{
    public async Task<ApiResponse<NoticeToProceedSummaryDto>> Handle(GetNoticeToProceedSummaryQuery request, CancellationToken cancellationToken)
    {
        var ntps = await unitOfWork.NoticeToProceedRepository.ToListAsync(
            unitOfWork.NoticeToProceedRepository.QueryWithDetails()
                .Where(n => !n.IsDeleted),
            cancellationToken
        );

        var draftCount = ntps.Count(n => n.Status == NoticeToProceedStatus.Draft);
        var issuedCount = ntps.Count(n => n.Status == NoticeToProceedStatus.Issued);
        var receivedCount = ntps.Count(n => n.Status == NoticeToProceedStatus.Received);
        var cancelledCount = ntps.Count(n => n.Status == NoticeToProceedStatus.Cancelled);
        var totalActive = ntps.Count(n => n.Status != NoticeToProceedStatus.Cancelled);

        var totalAwardedAmount = ntps
            .Where(n => n.Status != NoticeToProceedStatus.Cancelled)
            .Sum(n =>
            {
                if (n.AwardedAmountSnapshot > 0) return n.AwardedAmountSnapshot;
                return n.Contract?.NoticeOfAward?.AwardedAmount ?? 0m;
            });

        var summary = new NoticeToProceedSummaryDto
        {
            TotalCount = totalActive,
            DraftCount = draftCount,
            IssuedCount = issuedCount,
            ReceivedCount = receivedCount,
            CancelledCount = cancelledCount,
            TotalAwardedAmount = totalAwardedAmount
        };

        return ApiResponse<NoticeToProceedSummaryDto>.Success(summary);
    }
}
