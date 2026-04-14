using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<LineItemBudget>(context, sieveProcessor), ILineItemBudgetRepository
{
}