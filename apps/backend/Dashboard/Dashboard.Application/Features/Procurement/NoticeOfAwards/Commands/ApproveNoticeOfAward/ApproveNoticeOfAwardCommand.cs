using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;

public record ApproveNoticeOfAwardCommand(
    Guid Id,
    ApproveNoticeOfAwardRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
