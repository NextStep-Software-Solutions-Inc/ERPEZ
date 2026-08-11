namespace ERPEZ.Domain.Interfaces;

public interface IWFPRepository : IRepository<Entities.Planning.WFP>
{
    /// <summary>
    /// Fetches a WFP with the full objective/activity/timeline graph needed for
    /// Work Plan document generation, including orphan WFPObjectiveActivity rows
    /// (WFPObjectiveId == null, created via path 1b) which have no nav path from WFP.
    /// </summary>
    Task<Entities.Planning.WFP?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Standalone activities attached to this WFP directly (WFPObjectiveId is null).
    /// Mirrors LineItemBudgetRepository's pattern for standalone LineItemBudgetDetails,
    /// since WFP has no direct WFPObjectiveActivities navigation property.
    /// </summary>
    Task<List<Entities.Planning.WFPObjectiveActivity>> GetOrphanActivitiesAsync(Guid wfpId, CancellationToken cancellationToken = default);
}
