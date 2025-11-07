namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public class UpdateWFPDto
{
    public Guid DeliveryUnitId { get; set; }
    public string? ProgramTitle { get; set; }
    public string? Description { get; set; }
    public int? FiscalYear { get; set; }
    public decimal? ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public string? Status { get; set; }
}
