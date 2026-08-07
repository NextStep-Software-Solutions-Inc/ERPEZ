using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FunctionConfigRepository : Repository<FunctionConfig>, IFunctionConfigRepository
{
    private readonly ApplicationDbContext dbContext;

    public FunctionConfigRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<FunctionConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.FunctionConfigs!
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
