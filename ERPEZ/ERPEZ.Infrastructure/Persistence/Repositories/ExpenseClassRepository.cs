using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for ExpenseClass entity.
/// </summary>
public class ExpenseClassRepository : Repository<ExpenseClass>, IExpenseClassRepository
{
    public ExpenseClassRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : base(context, sieveProcessor)
    {
    }
}
