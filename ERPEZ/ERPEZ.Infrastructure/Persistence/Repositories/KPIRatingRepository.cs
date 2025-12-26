using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class RatingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Rating>(context, sieveProcessor),
      Domain.Interfaces.IRatingRepository
{
  private readonly ApplicationDbContext context = context;
  public Task<Domain.Entities.Planning.Rating?> GetByIdWithJoinAsync(Guid id, CancellationToken cancellationToken = default)
  {
    return context.Set<Domain.Entities.Planning.Rating>()
      .Include(r => r.KPIPerformanceMeasure)
      .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
  }
}
