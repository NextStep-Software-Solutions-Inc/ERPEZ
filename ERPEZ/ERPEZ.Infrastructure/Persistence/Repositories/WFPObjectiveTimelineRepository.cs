using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveTimelineRepository : Repository<WFPObjectiveTimeline>, IWFPObjectiveTimelineRepository
{
  private readonly ApplicationDbContext context;
  private readonly ISieveProcessor sieveProcessor;
  public WFPObjectiveTimelineRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : base(context, sieveProcessor)
  {
    this.context = context;
    this.sieveProcessor = sieveProcessor;
  }

  public async Task<List<WFPObjectiveTimeline>> GetByWFPObjectiveActivityIdAsync(
        Guid wfpObjectiveActivityId,
        CancellationToken cancellationToken = default)
    {
      var query = context.Set<WFPObjectiveTimeline>()
        .Where(t => t.WFPObjectiveActivityId == wfpObjectiveActivityId)
        .OrderBy(t => t.StartDate);

      return await ToListAsync(query, cancellationToken);
    }

}
