using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwards;

public record GetNoticeOfAwardsQuery : PaginatedQuery<PaginatedApiResponse<NoticeOfAwardListDto>>
{
    public string? Status { get; init; }
    public string? Search { get; init; }
}
