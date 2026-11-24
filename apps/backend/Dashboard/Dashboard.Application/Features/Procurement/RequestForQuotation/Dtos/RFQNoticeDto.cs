namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public class RFQNoticeItemDto
{
    public int ItemNo { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal ApprovedUnitCost { get; set; }
    public decimal TotalCost { get; set; }
}

public class RFQNoticeDto
{
    public Guid RFQId { get; set; }
    public string ReferenceNo { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public decimal ApprovedBudgetForContract { get; set; }
    public string DatePosted { get; set; } = string.Empty;
    public string SubmissionDeadline { get; set; } = string.Empty;
    public string ProcuringEntity { get; set; } = "[Head Office / Procuring Entity]";
    public string SubmissionLocation { get; set; } = "[Submission Location]";
    public string ContactEmail { get; set; } = "[BAC Email Address]";
    public string ContactPhone { get; set; } = "[BAC Contact Number]";
    public string BacChairpersonName { get; set; } = "[BAC Chairperson / Secretariat Name]";
    public string BacChairpersonTitle { get; set; } = "[BAC Chairperson / Secretariat Designation]";
    public string BacSecName { get; set; } = "[BAC Secretariat]";
    public string GeneralConditions { get; set; } = string.Empty;
    public List<RFQNoticeItemDto> Items { get; set; } = [];
}
