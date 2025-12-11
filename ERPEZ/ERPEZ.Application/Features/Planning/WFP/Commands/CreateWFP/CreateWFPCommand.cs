using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommand : IRequest<ApiResponse<Guid>>
{
    public Guid DeliveryUnitId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? FiscalYearId { get; set; }
    public DateOnly ProjectStartDate { get; set; }
    public DateOnly ProjectEndDate { get; set; }
    public decimal? ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
}
