using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.DeleteNoticeOfAward;

public record DeleteNoticeOfAwardCommand(
    Guid Id,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
