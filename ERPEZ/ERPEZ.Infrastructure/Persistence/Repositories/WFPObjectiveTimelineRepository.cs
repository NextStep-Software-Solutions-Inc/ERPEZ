using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveTimelineRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<WFPObjectiveTimeline>(context, sieveProcessor), IWFPObjectiveTimelineRepository
{
}
