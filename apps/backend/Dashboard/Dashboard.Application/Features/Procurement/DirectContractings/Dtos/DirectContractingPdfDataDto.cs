using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public class DirectContractingPdfDataDto
{
    public Guid DirectContractingId { get; set; }

    // Header information
    public string AgencyName { get; set; } = "Republic of the Philippines";
    public string AgencySubHeader { get; set; } = "BIDS AND AWARDS COMMITTEE";
    public string DocumentTitle { get; set; } = "JUSTIFICATION AND RESOLUTION FOR DIRECT CONTRACTING (RA 12009)";
    public string DocumentControlNumber { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public string ProcurementProjectReference { get; set; } = string.Empty;
    public string OfficeName { get; set; } = string.Empty;

    // Supplier profile
    public DirectContractingPdfSupplierDto Supplier { get; set; } = new();

    // Legal justification under RA 12009
    public string StatutoryGround { get; set; } = "RA 12009, Section 35 (Direct Contracting / Single-Source Procurement)";
    public string StatutoryCitation { get; set; } = "Pursuant to Section 35 of Republic Act No. 12009 (New Government Procurement Act - NGPA), Direct Contracting or Single-Source Procurement may be resorted to when the goods or services can be obtained only from an exclusive supplier or manufacturer, and no suitable substitute is available.";
    public string ExclusivityVerification { get; set; } = string.Empty;
    public string MarketScopingSummary { get; set; } = string.Empty;
    public string JustificationRemarks { get; set; } = string.Empty;

    // Expenditure summary & items
    public decimal ApprovedBudgetForContract { get; set; }
    public decimal TotalProposalAmount { get; set; }
    public bool HasSubmittedProposal { get; set; }
    public List<DirectContractingPdfItemDto> Items { get; set; } = [];

    // Signatory matrix
    public List<DirectContractingPdfSignatoryDto> Signatories { get; set; } = [];
    public string HeadOfAgencyName { get; set; } = string.Empty;
    public string HeadOfAgencyTitle { get; set; } = "HEAD OF THE PROCURING ENTITY";
    public string BacSecretariatHeadName { get; set; } = string.Empty;
    public string BacSecretariatHeadTitle { get; set; } = "Head, BAC Secretariat";
}

public class DirectContractingPdfSupplierDto
{
    public Guid SupplierId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string TINNumber { get; set; } = string.Empty;
    public string PhilGEPSNumber { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class DirectContractingPdfItemDto
{
    public int ItemNo { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Specifications { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = "unit";
    public decimal UnitABC { get; set; }
    public decimal TotalABC { get; set; }
    public decimal UnitBid { get; set; }
    public decimal TotalBid { get; set; }
    public decimal VarianceVsABC => TotalABC - TotalBid;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
}

public class DirectContractingPdfSignatoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int Order { get; set; }
}
