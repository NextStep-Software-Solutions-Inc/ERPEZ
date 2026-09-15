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
    public string ProcuringEntity { get; set; } = "University of Science and Technology of Southern Philippines";
    public string SubmissionLocation { get; set; } = "Procurement Unit, 2nd Floor, USTP Gymnasium building";
    public string ContactEmail { get; set; } = "bacsec@ustp.edu.ph";
    public string ContactPhone { get; set; } = "856-1738 Local 1164";
    public string BacChairpersonName { get; set; } = "ENGR. ALEX L. MAUREAL";
    public string BacChairpersonTitle { get; set; } = "BAC IV CHAIRPERSON";
    public string GeneralConditions { get; set; } = string.Empty;
    public List<RFQNoticeItemDto> Items { get; set; } = [];
}
