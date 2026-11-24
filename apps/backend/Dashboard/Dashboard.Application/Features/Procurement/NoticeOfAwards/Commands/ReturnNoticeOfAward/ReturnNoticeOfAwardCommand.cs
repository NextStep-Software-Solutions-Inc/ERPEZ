using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ReturnNoticeOfAward;

public record ReturnNoticeOfAwardCommand(
    Guid Id,
    ReturnNoticeOfAwardRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
