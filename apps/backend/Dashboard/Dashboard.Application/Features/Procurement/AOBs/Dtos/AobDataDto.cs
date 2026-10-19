namespace ERPEZ.Application.Features.Procurement.AOBs.Dtos;

public class AobItemDataDto
{
    public Guid RFQItemId { get; set; }
    /// <summary>
    /// Sequential 1-based counting number (1, 2, 3...)
    /// </summary>
    public int ItemNo { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Specifications { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "units";
    public decimal ApprovedUnitCost { get; set; }
    public decimal ApprovedTotalCost { get; set; }
    public Guid? AwardedSupplierId { get; set; }
    public string? AwardedSupplierName { get; set; }
    public decimal? AwardedUnitPrice { get; set; }
    public decimal? AwardedTotalAmount { get; set; }
}

public class AobSupplierBidDataDto
{
    public Guid RFQItemId { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public string? OfferedBrand { get; set; }
    public string? OfferedModel { get; set; }
    public string? OfferedSpecifications { get; set; }
    public string? OfferedRemarks { get; set; }
    public string? DeliveryPeriod { get; set; }
    public bool DidSubmit { get; set; }
    public bool IsWinner { get; set; }
}

public class AobSupplierDataDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal TotalQuotation { get; set; }
    public bool HasWonAnyItem { get; set; }
    public List<AobSupplierBidDataDto> Bids { get; set; } = [];
}

public class AobSignatoryDataDto
{
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class AobDataDto : ERPEZ.Application.Common.Interfaces.IAgencyLetterheadAware
{
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }

    public Guid AOBId { get; set; }
    public string AOBNumber { get; set; } = string.Empty;
    public string ProjectName { get; set; } = "[PROJECT NAME]";
    public string ModeOfProcurement { get; set; } = "Negotiated Procurement - Small Value Procurement - Section 53.9";
    public string DeliveryLocation { get; set; } = "[DELIVERY LOCATION]";
    public string ImplementingOffice { get; set; } = "[IMPLEMENTING OFFICE]";
    public decimal ApprovedTotalCost { get; set; }

    public List<AobItemDataDto> Items { get; set; } = [];
    public List<AobSupplierDataDto> Suppliers { get; set; } = [];
    public List<AobSignatoryDataDto> Signatories { get; set; } = [];

    public string ApprovedByName { get; set; } = "[HEAD OF PROCURING ENTITY / APPROVING AUTHORITY]";
    public string ApproverTitle { get; set; } = "[POSITION / DESIGNATION]";

    public string RFQNumber { get; set; } = "[RFQ NUMBER]";
    public string BacResolutionNumber { get; set; } = "[BAC RES. NO.]";
    public string PRNumber { get; set; } = "[PR NUMBER]";
    public string PAPCode { get; set; } = "[PAP CODE]";
}
