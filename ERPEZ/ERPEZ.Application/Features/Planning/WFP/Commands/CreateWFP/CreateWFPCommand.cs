using ERPEZ.Application.Features.Planning.WFP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommand : IRequest<ApiResponse<WFPDto>>
{
    public Guid DeliveryUnitId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? FiscalYear { get; set; }
    public decimal ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public string Status { get; set; } = string.Empty;
}
