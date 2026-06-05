using ERPEZ.Domain.Common;
using Sieve.Attributes;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Domain.Entities.Planning;

public class GeneratedDocument : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public DocumentType DocumentType { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public ExportFormat Format { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AgencyId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Agency Agency { get; set; } = null!;
    /// <summary>Relative path from the storage root.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string StoragePath { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string FileName { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public long FileSizeBytes { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string FiscalYear { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string GeneratedBy { get; set; } = string.Empty;   // from JWT claim
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}