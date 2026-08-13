using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.CreateOffice;

public record CreateOfficeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; set; }
    public required string Code { get; set; }
    public required string Address { get; set; }
    public string? Description { get; set; }
    public string? ResponsibilityCenterCode { get; set; }
    public string? BudgetCostCenter { get; set; }
    public Guid OfficeTypeId { get; set; }
    public Guid? OrganizationId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid AdministrativeLevelId { get; set; }
    public Guid? ClusterId { get; set; }
    public Guid? ProcurementWorkflowId { get; set; }
    public Guid? ParentId { get; set; }
}
