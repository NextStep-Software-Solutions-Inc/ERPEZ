using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardSummary;

public record GetNoticeOfAwardSummaryQuery : IRequest<ApiResponse<NoticeOfAwardSummaryDto>>;

public class GetNoticeOfAwardSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNoticeOfAwardSummaryQuery, ApiResponse<NoticeOfAwardSummaryDto>>
{
    public async Task<ApiResponse<NoticeOfAwardSummaryDto>> Handle(GetNoticeOfAwardSummaryQuery request, CancellationToken cancellationToken)
    {
        var allNoas = await unitOfWork.NoticeOfAwardRepository.ToListAsync(
            unitOfWork.NoticeOfAwardRepository.Query(),
            cancellationToken
        );

        var allMilestones = await unitOfWork.NoticeOfAwardMilestoneRepository.ToListAsync(
            unitOfWork.NoticeOfAwardMilestoneRepository.Query(),
            cancellationToken
        );

        var draftCount = allNoas.Count(n => n.Status == NoticeOfAwardStatus.Draft);
        var forApprovalCount = allNoas.Count(n => n.Status == NoticeOfAwardStatus.ForApproval);
        var returnedCount = allNoas.Count(n => n.Status == NoticeOfAwardStatus.Returned);
        var approvedCount = allNoas.Count(n => n.Status == NoticeOfAwardStatus.Approved);
        var runningTotal = allNoas.Sum(n => n.AwardedAmount);

        var approvedNoas = allNoas.Where(n => n.Status == NoticeOfAwardStatus.Approved).ToList();
        var openSlaCount = 0;
        var overdueSlaCount = 0;

        foreach (var noa in approvedNoas)
        {
            var noaMilestones = allMilestones.Where(m => m.NoticeOfAwardId == noa.Id);
            var sla = NoticeOfAwardSlaCalculator.CalculateSla(noa, noaMilestones);
            if (sla.IsOpen) openSlaCount++;
            if (sla.IsOverdue) overdueSlaCount++;
        }

        var dto = new NoticeOfAwardSummaryDto
        {
            Draft = draftCount,
            ForApproval = forApprovalCount,
            Returned = returnedCount,
            Approved = approvedCount,
            OpenSla = openSlaCount,
            OverdueSla = overdueSlaCount,
            RunningTotal = runningTotal
        };

        return ApiResponse<NoticeOfAwardSummaryDto>.Success(dto);
    }
}
