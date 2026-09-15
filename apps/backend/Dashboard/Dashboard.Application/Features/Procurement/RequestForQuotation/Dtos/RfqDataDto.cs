namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;

public class RfqItemDataDto
{
    public int ItemNo { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Specifications { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal ApprovedUnitCost { get; set; }
    public decimal ApprovedTotalCost { get; set; }
    public decimal? QuotedUnitPrice { get; set; }
    public decimal? QuotedTotalCost { get; set; }
    public string? OfferedBrand { get; set; }
    public string? OfferedModel { get; set; }
    public string? OfferedSpecifications { get; set; }
}

public class RfqSupplierDataDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string TradeName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<RfqItemDataDto> QuotedItems { get; set; } = [];
}

public class RfqDataDto
{
    public Guid RFQId { get; set; }
    public string RFQNumber { get; set; } = string.Empty;
    public string QuotationNo { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public decimal ApprovedBudgetForContract { get; set; }
    public string PRNumber { get; set; } = string.Empty;
    public string BacResolutionNumber { get; set; } = string.Empty;
    public string ProcuringEntity { get; set; } = "University of Science and Technology of Southern Philippines";
    public string SubmissionLocation { get; set; } = "Procurement Unit, 2nd Floor, USTP Gymnasium building";
    public string ContactEmail { get; set; } = "bacsec@ustp.edu.ph";
    public string ContactPhone { get; set; } = "856-1738 Local 1164";
    public string BacChairpersonName { get; set; } = "ENGR. ALEX L. MAUREAL";
    public string BacChairpersonTitle { get; set; } = "BAC IV CHAIRPERSON";
    public string DeliveryPeriod { get; set; } = "15 CALENDAR DAY UPON RECEIPT OF Purchase Order.";
    public List<RfqItemDataDto> Items { get; set; } = [];
    public List<RfqSupplierDataDto> Suppliers { get; set; } = [];
}
