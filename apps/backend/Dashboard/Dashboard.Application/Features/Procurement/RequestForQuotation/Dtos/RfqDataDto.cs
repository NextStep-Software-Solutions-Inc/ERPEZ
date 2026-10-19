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
    public string TINNumber { get; set; } = string.Empty;
    public string PhilGEPSNumber { get; set; } = string.Empty;
    public List<RfqItemDataDto> QuotedItems { get; set; } = [];
}

public class RfqDataDto : ERPEZ.Application.Common.Interfaces.IAgencyLetterheadAware
{
    public string? ProcuringEntityName
    {
        get => ProcuringEntity;
        set => ProcuringEntity = value ?? string.Empty;
    }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }

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
    public string ProcuringEntity { get; set; } = "Central Mindanao University";
    public string SubmissionLocation { get; set; } = "[Submission Location]";
    public string DeliveryLocation { get; set; } = "[Delivery Location]";
    public string ContactEmail { get; set; } = "[BAC Email Address]";
    public string ContactPhone { get; set; } = "[BAC Contact Number]";
    public string BacChairpersonName { get; set; } = "[BAC Chairperson / Secretariat Name]";
    public string BacChairpersonTitle { get; set; } = "[BAC Chairperson / Secretariat Designation]";
    public string BacSecName { get; set; } = "[BAC Secretariat]";
    public string DeliveryPeriod { get; set; } = "[Delivery Period]";
    public bool IsBlankTemplate { get; set; }
    public string? SignatoryName { get; set; }
    public string? DateSigned { get; set; }
    public List<RfqItemDataDto> Items { get; set; } = [];
    public List<RfqSupplierDataDto> Suppliers { get; set; } = [];
}
