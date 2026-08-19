using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;

public class APRListItemDto
{
    public Guid Id { get; set; }
    public string APRNumber { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateOnly RequestDate { get; set; }
    public StatusEnum Status { get; set; }
    public string OfficeName { get; set; } = string.Empty;
    public int FiscalYear { get; set; }
}

public class APRDetailDto
{
    public Guid Id { get; set; }
    public string APRNumber { get; set; } = string.Empty;
    public Guid APPId { get; set; }
    public string APPNumber { get; set; } = string.Empty;
    public Guid OfficeId { get; set; }
    public string OfficeName { get; set; } = string.Empty;
    public Guid FiscalYearId { get; set; }
    public int FiscalYear { get; set; }
    public decimal TotalAmount { get; set; }
    public StatusEnum Status { get; set; }
    public string? AgencyControlNumber { get; set; }
    public string? AgencyAccountCode { get; set; }
    public DateOnly RequestDate { get; set; }
    public string? Description { get; set; }
    public APRModeOfDelivery ModeOfDelivery { get; set; }
    public APRInsufficientFundsAction InsufficientFundsAction { get; set; }
    public bool RequiresObR { get; set; }
    public bool RequiresCBA { get; set; }
    public bool RequiresCompleteSpecifications { get; set; }
    public string? AdditionalRemarks { get; set; }
    public DateTime? SubmittedDate { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public DateTime? ReturnedDate { get; set; }
    public string? ReturnRemarks { get; set; }
    public string? ApprovedBy { get; set; }
    public string? ReturnedBy { get; set; }
    public List<APRItemDto> Items { get; set; } = [];
}

public class APRItemDto
{
    public Guid Id { get; set; }
    public Guid? APPItemId { get; set; }
    public Guid? PPMPItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal QuantityRequested { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
    public List<APRItemMilestoneDto> Milestones { get; set; } = [];
}

public class APRItemMilestoneDto
{
    public Guid Id { get; set; }
    public Guid ProcurementActivityTypeId { get; set; }
    public string ProcurementActivityTypeName { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public string? Remarks { get; set; }
}
