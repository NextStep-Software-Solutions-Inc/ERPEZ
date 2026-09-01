using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.CreateProcurementProject;

public record CreateProcurementProjectCommand : IRequest<ApiResponse<Guid>>
{
    public ProcurementProjectSourceType SourceType { get; init; } = ProcurementProjectSourceType.ConsolidatedPR;
    public Guid? APPItemId { get; init; }
    public List<Guid>? APPItemIds { get; init; }
    public Guid? ConsolidatedPRId { get; init; }

    public string? Title { get; init; }
    public decimal? ABC { get; init; }
    public string ResolutionType { get; init; } = string.Empty;
    public string ResolutionNumber { get; init; } = string.Empty;
    public DateTime DateResolved { get; init; } = DateTime.UtcNow;
    public string? ResolvedLocation { get; init; }
    public List<WhereasClauseItemInputDto>? WhereasClauses { get; init; }
    public List<ResolutionClauseItemInputDto>? WhereasClauseLinks { get; init; }
    public List<ResolutionClauseItemInputDto>? NowThereforeClauses { get; init; }
    public List<ResolutionClauseItemInputDto>? ResolvedClauses { get; init; }
    public Guid? EndUserRepresentativeId { get; init; }
    public Guid? TechRepresentativeId { get; init; }
}

public record WhereasClauseItemInputDto(Guid WhereasClauseId, int Order)
{
    public WhereasClauseItemInputDto() : this(Guid.Empty, 0) { }
}

public record ResolutionClauseItemInputDto(Guid ResolutionClauseId, int Order)
{
    public ResolutionClauseItemInputDto() : this(Guid.Empty, 0) { }
}

