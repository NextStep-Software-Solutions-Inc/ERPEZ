using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for ObjectExpenseClass entity.
/// </summary>
public class ObjectExpenseClassRepository : Repository<ObjectExpenseClass>, IObjectExpenseClassRepository
{
    public ObjectExpenseClassRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : base(context, sieveProcessor)
    {
    }
}
