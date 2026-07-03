using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.CreateDirectContracting;

public record CreateDirectContractingCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required Guid BACResolutionId { get; init; }
    public required Guid ExclusiveSupplierId { get; init; }
    public required DateTime SubmissionDeadline { get; init; }
}
