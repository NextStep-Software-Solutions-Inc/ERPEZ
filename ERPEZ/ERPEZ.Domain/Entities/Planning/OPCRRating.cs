using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRRating : BaseEntity
{

    public Guid OPCREvaluationId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public Guid OPCRKPIId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
    public virtual OPCRKPI OPCRKPI { get; set; } = null!;
    public virtual OPCREvaluation OPCREvaluation { get; set; } = null!;
    public virtual PerformanceMeasure PerformanceMeasure { get; set; } = null!;
}
