using System;
using System.Collections.Generic;
using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Recorded purchase entry under Direct Acquisition (RA 12009).
/// Captures reputable retail/online merchant info, final cost, transaction date,
/// and payment/reimbursement payee specifications.
/// </summary>
public class DirectPurchaseEntry : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DirectAcquisitionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? SupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string SupplierName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? SupplierTIN { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal FinalAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime TransactionDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DirectAcquisitionPaymentMethodEnum PaymentMethod { get; set; } = DirectAcquisitionPaymentMethodEnum.DIRECT_TO_VENDOR;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PayeeUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? PayeeName { get; set; }

    public string? Remarks { get; set; }

    // Navigation properties
    public virtual DirectAcquisition DirectAcquisition { get; set; } = null!;
    public virtual Supplier? Supplier { get; set; }
    public virtual User? PayeeUser { get; set; }
    public virtual List<DirectAcquisitionDocument> ProofDocuments { get; set; } = [];
}
