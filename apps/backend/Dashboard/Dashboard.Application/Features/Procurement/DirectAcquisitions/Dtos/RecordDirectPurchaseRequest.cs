using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectAcquisitionProofFileRequest
{
    public Guid FileId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public string? DocumentType { get; set; } = "PROOF_OF_TRANSACTION";
}

public class RecordDirectPurchaseRequest
{
    public Guid? SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierTIN { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime TransactionDate { get; set; }
    public DirectAcquisitionPaymentMethodEnum PaymentMethod { get; set; } = DirectAcquisitionPaymentMethodEnum.DIRECT_TO_VENDOR;
    public Guid? PayeeUserId { get; set; }
    public string? PayeeName { get; set; }
    public string? Remarks { get; set; }
    public List<DirectAcquisitionProofFileRequest> ProofFiles { get; set; } = [];
}
