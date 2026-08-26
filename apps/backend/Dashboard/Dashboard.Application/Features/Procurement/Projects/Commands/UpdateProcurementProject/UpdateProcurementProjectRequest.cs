using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProject;

public record UpdateProcurementProjectRequest
{
    public string? Title { get; init; }
    public string? Status { get; init; }
    public string? ResolutionType { get; init; }
    public string? ResolutionNumber { get; init; }
    public DateTime? DateResolved { get; init; }
    public string? ResolvedLocation { get; init; }
    public List<WhereasClauseItemInputDto>? WhereasClauses { get; init; }
    public Guid? EndUserRepresentativeId { get; init; }
    public Guid? TechRepresentativeId { get; init; }
}
