using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.SubmitNoticeOfAward;

public record SubmitNoticeOfAwardCommand(
    Guid Id,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
