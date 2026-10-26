using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents uploaded proof or approval documents associated with Direct Acquisition.
/// Maps to files handled by IFileStorageService.
/// </summary>
public class DirectAcquisitionDocument : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DirectAcquisitionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? DirectPurchaseEntryId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FileId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string? FileType { get; set; }

    public string? BlobUrl { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string DocumentType { get; set; } = "PROOF_OF_TRANSACTION";

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual DirectAcquisition DirectAcquisition { get; set; } = null!;
    public virtual DirectPurchaseEntry? DirectPurchaseEntry { get; set; }
}
