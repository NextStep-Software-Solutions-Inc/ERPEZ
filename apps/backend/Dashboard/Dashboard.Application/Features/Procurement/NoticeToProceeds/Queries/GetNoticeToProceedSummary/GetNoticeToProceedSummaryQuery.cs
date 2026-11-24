using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedSummary;

public record GetNoticeToProceedSummaryQuery : IRequest<ApiResponse<NoticeToProceedSummaryDto>>;
