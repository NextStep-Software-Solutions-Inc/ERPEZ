using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;

public record SendPostQualificationNoticeCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required SendPostQualificationNoticeRequest Request { get; init; }
}
