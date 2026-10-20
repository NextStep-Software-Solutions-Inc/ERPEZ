using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;

/// <summary>
/// DTO containing all resolved fields required to render the official COA GAM Appendix 61 Purchase Order document.
/// </summary>
public class PurchaseOrderDataDto : ERPEZ.Application.Common.Interfaces.IAgencyLetterheadAware
{
    public Guid Id { get; set; }
    public string PONumber { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public string ProcurementMode { get; set; } = string.Empty;
    public string TypeOfPO { get; set; } = string.Empty;
    public string SourceDocumentType { get; set; } = string.Empty;
    public string SourceDocumentNumber { get; set; } = string.Empty;

    public string? ProcuringEntityName { get; set; } = "Agency Name";
    public string ProcuringEntityOffice { get; set; } = string.Empty;
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string SupplierAddress { get; set; } = "Philippines";
    public string SupplierTIN { get; set; } = string.Empty;

    public string PlaceOfDelivery { get; set; } = string.Empty;
    public DateTime? DateOfDelivery { get; set; }
    public string DeliveryTerm { get; set; } = string.Empty;
    public string PaymentTerm { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }
    public string AmountInWords { get; set; } = string.Empty;

    public string ApprovedByName { get; set; } = string.Empty;
    public string ApprovedByPosition { get; set; } = "Authorized Official";
    public DateTime? ApprovedAt { get; set; }

    public List<PurchaseOrderItemDataDto> Items { get; set; } = [];
}

public class PurchaseOrderItemDataDto
{
    public int ItemNumber { get; set; }
    public string StockNo { get; set; } = "-";
    public string Unit { get; set; } = "unit";
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}
