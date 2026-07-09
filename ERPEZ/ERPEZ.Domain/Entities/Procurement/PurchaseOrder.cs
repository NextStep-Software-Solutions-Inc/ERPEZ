using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using System;
using System.Collections.Generic;

namespace ERPEZ.Domain.Entities.Procurement;

public class PurchaseOrder : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string PONumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public POProcurementModeEnum ProcurementMode { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public SourceDocumentTypeEnum SourceDocumentType { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SourceDocumentId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly Date { get; set; }

    public string? PlaceOfDelivery { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly? DateOfDelivery { get; set; }

    public string? DeliveryTerm { get; set; }

    public string? PaymentTerm { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    public string? SupportingDocumentUrl { get; set; }

    public virtual List<PurchaseOrderItem> PurchaseOrderItems { get; set; } = [];
}
