using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public record CreateProcurementProjectCommand : IRequest<ApiResponse<Guid>>
{
    public string? Title { get; init; }
    public decimal? ABC { get; init; }
    public ProcurementProjectSourceType SourceType { get; init; }
    public Guid? APPItemId { get; init; }
    public Guid? ConsolidatedPRId { get; init; }
    public string ResolutionType { get; init; } = "Standard";
    public string ResolutionNumber { get; init; } = string.Empty;
    public DateTime DateResolved { get; init; } = DateTime.UtcNow;
    public string ResolvedLocation { get; init; } = string.Empty;
    public List<Guid> SelectedTemplateClauseIds { get; init; } = [];
    public List<string> CustomClauses { get; init; } = [];
    public Guid? EndUserRepresentativeId { get; init; }
    public Guid? TechRepresentativeId { get; init; }
    public Guid UserId { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
}
