namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record UpdateOfficeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Address { get; init; }
    public string? Description { get; init; }
    public string? ResponsibilityCenterCode { get; init; }
    public string? BudgetCostCenter { get; init; }
    public Guid? OfficeTypeId { get; init; }
    public Guid? OrganizationId { get; init; }
    public Guid? CategoryId { get; init; }
    public Guid? AdministrativeLevelId { get; init; }
    public Guid? ClusterId { get; init; }
    public Guid? ProcurementWorkflowId { get; init; }
    public Guid? ParentId { get; init; }
}
