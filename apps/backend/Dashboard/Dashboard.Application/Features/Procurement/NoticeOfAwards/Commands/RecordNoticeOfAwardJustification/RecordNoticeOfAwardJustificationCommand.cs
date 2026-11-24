using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardJustification;

public record RecordNoticeOfAwardJustificationCommand(
    Guid Id,
    RecordNoticeOfAwardJustificationRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Unit>>;
