using ERPEZ.Domain.Entities.Finance;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AccountRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Account>(context, sieveProcessor),
      Domain.Interfaces.IAccountRepository
{
}
