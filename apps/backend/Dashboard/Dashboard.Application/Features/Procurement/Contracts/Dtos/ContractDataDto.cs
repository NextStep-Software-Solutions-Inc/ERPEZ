using System;
using System.Collections.Generic;
using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Features.Procurement.Contracts.Dtos;

public class ContractDataDto : IAgencyLetterheadAware
{
    public Guid Id { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public DateTime? ContractDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    // Procuring Entity Information
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityOffice { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }

    // Supplier Information
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierAddress { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;

    // Project & Upstream Procurement Details
    public Guid ProcurementProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public string ProcurementType { get; set; } = "GoodsAndServices";
    public string ModeOfProcurement { get; set; } = string.Empty;
    public string BACResolutionNumber { get; set; } = string.Empty;
    public string NOANumber { get; set; } = string.Empty;
    public DateTime? NOADate { get; set; }

    // Financial Figures
    public decimal ContractPrice { get; set; }
    public string AmountInWords { get; set; } = string.Empty;

    // Signatories & Execution
    public string ApprovedByName { get; set; } = "Head of the Procuring Entity";
    public string ApprovedByPosition { get; set; } = "Head of the Procuring Entity";
    public DateTime? ApprovedAt { get; set; }
    public string ExecutedByName { get; set; } = string.Empty;
    public DateTime? ExecutedAt { get; set; }

    // Awarded Line Items (Contract Annex "A")
    public List<ContractLineItemDataDto> LineItems { get; set; } = [];
}

public class ContractLineItemDataDto
{
    public int ItemNumber { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Specifications { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
}