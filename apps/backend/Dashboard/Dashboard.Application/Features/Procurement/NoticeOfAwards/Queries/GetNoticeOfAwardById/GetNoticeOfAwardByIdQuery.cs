using System;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardById;

public record GetNoticeOfAwardByIdQuery(Guid Id) : IRequest<ApiResponse<NoticeOfAwardDetailDto>>;
