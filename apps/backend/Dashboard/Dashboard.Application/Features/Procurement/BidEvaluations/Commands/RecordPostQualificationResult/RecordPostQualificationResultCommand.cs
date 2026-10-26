using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;

public record RecordPostQualificationResultCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required RecordPostQualificationResultRequest Request { get; init; }
}
