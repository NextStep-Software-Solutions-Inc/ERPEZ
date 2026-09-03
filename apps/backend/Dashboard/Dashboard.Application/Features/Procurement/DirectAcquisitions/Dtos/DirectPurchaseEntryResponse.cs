using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectPurchaseEntryResponse
{
    public Guid Id { get; set; }
    public Guid DirectAcquisitionId { get; set; }
    public Guid? SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierTIN { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime TransactionDate { get; set; }
    public DirectAcquisitionPaymentMethodEnum PaymentMethod { get; set; }
    public Guid? PayeeUserId { get; set; }
    public string? PayeeName { get; set; }
    public string? Remarks { get; set; }
    public List<DirectAcquisitionDocumentResponse> ProofDocuments { get; set; } = [];
}
