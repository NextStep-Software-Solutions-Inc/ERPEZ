using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FunctionConfigRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<FunctionConfig>(context, sieveProcessor), IFunctionConfigRepository
{
    public async Task<FunctionConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.FunctionConfigs!
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
