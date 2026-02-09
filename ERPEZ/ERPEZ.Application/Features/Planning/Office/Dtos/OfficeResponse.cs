using ERPEZ.Application.Features.Planning.Cluster.Dtos;

namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record OfficeResponse
{
    public Guid Id { get; init; }
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
    public DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; }
    
    // Lookup Details
    public string OfficeTypeName { get; init; } = string.Empty;
    public string OrganizationName { get; init; } = string.Empty;
    public string CategoryName { get; init; } = string.Empty;
    public string AdministrativeLevelName { get; init; } = string.Empty;
    public ClusterResponse? Cluster { get; init; }
    public string? ProcurementWorkflowName { get; init; }
    public string? ParentOfficeName { get; init; }
}
