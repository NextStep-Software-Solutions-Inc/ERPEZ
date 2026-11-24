using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FiscalYearRepository : Repository<Domain.Entities.Planning.FiscalYear>, IFiscalYearRepository
{
    private readonly ApplicationDbContext context;

    public FiscalYearRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }
    public async Task<Domain.Entities.Planning.FiscalYear?> GetWithAllocationsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.FiscalYear>()
            .Include(fy => fy.FunctionAllocations)
            .FirstOrDefaultAsync(fy => EF.Property<Guid>(fy, "Id") == id, cancellationToken);
    }

    public async Task<Domain.Entities.Planning.FiscalYear?> GetByYearAsync(int year, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.FiscalYear>().FirstOrDefaultAsync(fy => fy.Year == year, cancellationToken);
    }
}
