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
    public List<BACResolutionWhereasClauseItemResponse> WhereasClauses { get; init; } = [];

    public List<BiddingActivityScheduleResponse> BiddingActivitySchedules { get; init; } = [];
    public Guid? EndUserRepresentativeId { get; init; }
    public ProjectUserResponse? EndUserRepresentative { get; init; }
    public Guid? TechRepresentativeId { get; init; }
    public ProjectUserResponse? TechRepresentative { get; init; }
}

public record BACResolutionWhereasClauseItemResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public int Order { get; init; }
}
