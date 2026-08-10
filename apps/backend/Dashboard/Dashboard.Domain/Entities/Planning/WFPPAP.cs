using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPPAP : BaseEntity
{
    public Guid WFPId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OutputIndicator { get; set; } = string.Empty;
    public string Deliverable { get; set; } = string.Empty;
    public string Timeframe { get; set; } = string.Empty;
    public List<string?> PersonsInvolved { get; set; } = [];

    public virtual WFP WFP { get; set; } = null!;
    public virtual List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = [];
}
