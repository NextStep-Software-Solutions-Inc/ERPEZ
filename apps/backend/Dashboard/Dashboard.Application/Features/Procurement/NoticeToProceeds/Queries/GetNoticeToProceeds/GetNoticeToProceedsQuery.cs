using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceeds;

public record GetNoticeToProceedsQuery : PaginatedQuery<PaginatedApiResponse<NoticeToProceedListDto>>
{
    public string? Status { get; init; }
    public string? Search { get; init; }
}

