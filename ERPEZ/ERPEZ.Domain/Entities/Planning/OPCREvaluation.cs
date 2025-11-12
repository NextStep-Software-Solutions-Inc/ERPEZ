using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCREvaluation : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid EvaluatorId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EvaluationDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Comments { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    public virtual List<OPCRRating> OPCRRatings { get; set; } = [];
    public virtual OPCR OPCR { get; set; } = null!;
}
