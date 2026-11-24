using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;

public record LogPostQualificationDocsReceivedCommand : IRequest<ApiResponse<Guid>>
{
    public Guid ProjectId { get; init; }
    public required LogPostQualificationDocsReceivedRequest Request { get; init; }
}
