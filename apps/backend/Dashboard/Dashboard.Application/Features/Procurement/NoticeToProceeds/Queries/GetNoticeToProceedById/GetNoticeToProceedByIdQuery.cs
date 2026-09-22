using System;
using ERPEZ.Application.Features.Procurement.NoticeToProceeds.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Queries.GetNoticeToProceedById;

public record GetNoticeToProceedByIdQuery(Guid Id) : IRequest<ApiResponse<NoticeToProceedDetailDto>>;
