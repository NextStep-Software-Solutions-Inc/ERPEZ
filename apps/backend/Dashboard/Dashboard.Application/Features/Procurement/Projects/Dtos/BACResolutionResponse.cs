using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record BACResolutionResponse
{
    public Guid Id { get; init; }
    public Guid ProcurementProjectId { get; init; }
    public string ResolutionType { get; init; } = string.Empty;
    public string ResolutionNumber { get; init; } = string.Empty;
    public DateTime DateResolved { get; init; }
    public string? ResolvedLocation { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? WhereasClause { get; init; }
    public List<BACResolutionWhereasClauseResponse> WhereasClauses { get; init; } = [];
}
