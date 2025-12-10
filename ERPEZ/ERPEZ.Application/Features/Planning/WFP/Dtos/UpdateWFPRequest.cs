namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public class UpdateWFPRequest
{
    public Guid DeliveryUnitId { get; set; }
    public string? ProjectTitle { get; set; }
    public string? Description { get; set; }
    public Guid? FiscalYearId { get; set; }
    public DateOnly? ProjectStartDate { get; set; }
    public DateOnly? ProjectEndDate { get; set; }
    public decimal? ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public string? Status { get; set; }
}
