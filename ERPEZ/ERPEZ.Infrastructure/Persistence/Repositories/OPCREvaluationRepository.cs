using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCREvaluationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.OPCREvaluation>(context, sieveProcessor),
      Domain.Interfaces.IOPCREvaluationRepository
{
}
