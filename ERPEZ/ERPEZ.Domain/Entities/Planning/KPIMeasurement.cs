using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIMeasurement : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Dimension { get; set; } = string.Empty; // Enum: Quantity, Quality, Timeliness

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? RatingScaleTemplateId { get; set; }

    public List<string> MOVs { get; set; } = []; // Array of strings

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsMOVEditable { get; set; } = true;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsScaleEditable { get; set; } = true;

    // Navigation Properties
    public virtual KPI? KPI { get; set; }
    public virtual RatingScaleTemplate? RatingScaleTemplate { get; set; }
}
