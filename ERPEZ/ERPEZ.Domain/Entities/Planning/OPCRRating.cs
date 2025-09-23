using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRRating : BaseEntity
{
    public Guid OPCREvaluationId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public Guid OPCRKPIId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}
