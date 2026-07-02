using System;
using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ReviewAction
{
    Approved,
    Returned
}

public record ReviewDirectContractingProposalCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DirectContractingId { get; init; }
    public ReviewAction Action { get; init; }
    public string? Remarks { get; init; }
}
