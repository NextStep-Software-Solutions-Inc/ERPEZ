using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<LineItemBudgetActivity>(context, sieveProcessor), ILineItemBudgetActivityRepository
{
}