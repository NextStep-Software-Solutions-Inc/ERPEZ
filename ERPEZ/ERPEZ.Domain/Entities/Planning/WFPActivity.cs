using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPActivity : BaseEntity
{
    public Guid WFPId { get; set; }
    public Guid WFPOutcomeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OutputIndicator { get; set; } = string.Empty;
    public string Deliverable { get; set; } = string.Empty;
    public string Timeframe { get; set; } = string.Empty;
    public List<string>? PersonsInvolved { get; set; }
    [JsonIgnore]
    public virtual WFP WFP { get; set; } = null!;
    [JsonIgnore]
    public virtual WFPOutcome WFPOutcome { get; set; } = null!;
    public List<ActivityBudgetRequirement> ActivityBudgetRequirements { get; set; } = null!;
    public List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = null!;

}
