using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.UpdateNoticeOfAward;

public record UpdateNoticeOfAwardCommand(
    Guid Id,
    UpdateNoticeOfAwardRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
