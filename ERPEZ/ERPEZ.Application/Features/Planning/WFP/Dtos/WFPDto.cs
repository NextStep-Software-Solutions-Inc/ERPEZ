using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.WFP.Dtos;

public class WFPDto
{
    public Guid Id { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string? Description { get; set; };
    public Guid? FiscalYearId { get; set; };
    public DateOnly ProjectStartDate { get; set; };
    public DateOnly ProjectEndDate { get; set; }
    public decimal? ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public StatusEnum Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}
