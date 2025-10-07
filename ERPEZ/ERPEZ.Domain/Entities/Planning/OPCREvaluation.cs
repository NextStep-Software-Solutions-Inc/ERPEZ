using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCREvaluation : BaseEntity
{
    public Guid OPCRId { get; set; }
    public Guid EvaluatorId { get; set; }
    public DateTime EvaluationDate { get; set; }
    public string? Comments { get; set; }
    public string Status { get; set; } = string.Empty;
    public virtual List<OPCRRating> OPCRRatings { get; set; } = [];
    public virtual OPCR OPCR { get; set; } = null!;
}
