using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;

public record CreateNoticeOfAwardCommand(
    CreateNoticeOfAwardRequest Request,
    Guid ActorId,
    string ActorName
) : IRequest<ApiResponse<Guid>>;
