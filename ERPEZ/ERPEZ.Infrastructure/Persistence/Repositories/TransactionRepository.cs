using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ITransactionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Transaction>(context, sieveProcessor),
      Domain.Interfaces.ITransactionRepository;