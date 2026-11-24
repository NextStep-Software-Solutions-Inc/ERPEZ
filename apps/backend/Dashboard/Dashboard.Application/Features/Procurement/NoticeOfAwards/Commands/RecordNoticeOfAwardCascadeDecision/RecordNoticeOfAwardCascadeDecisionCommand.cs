using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardCascadeDecision;

public record RecordNoticeOfAwardCascadeDecisionCommand(
    Guid Id,
    RecordNoticeOfAwardCascadeDecisionRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
