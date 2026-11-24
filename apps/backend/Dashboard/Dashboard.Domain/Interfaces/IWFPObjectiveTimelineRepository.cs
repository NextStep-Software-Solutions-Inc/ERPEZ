using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IWFPObjectiveTimelineRepository : IRepository<WFPObjectiveTimeline>
{
    Task<List<WFPObjectiveTimeline>> GetByWFPObjectiveActivityIdAsync(Guid wfpObjectiveActivityId, CancellationToken cancellationToken = default);
}
