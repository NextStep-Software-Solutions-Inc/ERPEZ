using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public record UpdateDirectContractingRequest
{
    public required string Name { get; init; }
    public required Guid ExclusiveSupplierId { get; init; }
    public required DateTime SubmissionDeadline { get; init; }
}
