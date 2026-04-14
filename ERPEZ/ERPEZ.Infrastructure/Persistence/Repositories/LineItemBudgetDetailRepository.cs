using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LineItemBudgetDetailRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<LineItemBudgetDetail>(context, sieveProcessor), ILineItemBudgetDetailRepository
{
}