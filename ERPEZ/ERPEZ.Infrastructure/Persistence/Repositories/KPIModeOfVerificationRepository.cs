using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIModeOfVerificationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.KPIModeOfVerification>(context, sieveProcessor), Domain.Interfaces.IKPIModeOfVerificationRepository
{
}
