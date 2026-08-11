using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BudgetCallRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<BudgetCall>(context, sieveProcessor), IBudgetCallRepository
{
}
