using System;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public class EligibleConsolidatedPRDto
{
    public Guid Id { get; set; }
    public string PRNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EndUser { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string ModeOfProcurementName { get; set; } = string.Empty;
    public Guid? ProcurementModeId { get; set; }
}
