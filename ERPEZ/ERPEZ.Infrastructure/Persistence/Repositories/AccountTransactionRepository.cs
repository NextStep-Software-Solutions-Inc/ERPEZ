using ERPEZ.Domain.Entities.Finance;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AccountTransactionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<AccountTransaction>(context, sieveProcessor),
      Domain.Interfaces.IAccountTransactionRepository
{
}
