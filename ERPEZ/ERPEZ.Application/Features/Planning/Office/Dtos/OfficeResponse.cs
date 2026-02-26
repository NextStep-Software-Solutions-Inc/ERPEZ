using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Application.Features.Planning.Category.Dtos;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;

namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record OfficeResponse
{
    public Guid Id { get; init; }
    public int PositionCounts { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required string Address { get; init; }
    public string? Description { get; init; }
    public string? ResponsibilityCenterCode { get; init; }
    public string? BudgetCostCenter { get; init; }
    public Guid OfficeTypeId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid CategoryId { get; init; }
    public Guid AdministrativeLevelId { get; init; }
    public Guid? ClusterId { get; init; }
    public Guid? ProcurementWorkflowId { get; init; }
    public Guid? ParentId { get; init; }
    
    // Navigation Properties - Full nested objects
    public OfficeTypeResponse? OfficeType { get; init; }
    public OrganizationResponse? Organization { get; init; }
    public CategoryResponse? Category { get; init; }
    public AdministrativeLevelResponse? AdministrativeLevel { get; init; }
    public ClusterResponse? Cluster { get; init; }
    public ProcurementWorkflowResponse? ProcurementWorkflow { get; init; }
    public ParentOfficeResponse? ParentOffice { get; init; }
}

public record ParentOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}
