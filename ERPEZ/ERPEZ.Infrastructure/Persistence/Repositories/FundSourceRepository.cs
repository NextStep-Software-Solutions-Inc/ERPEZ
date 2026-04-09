using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FundSourceRepository : Repository<Domain.Entities.Planning.FundSource>, Domain.Interfaces.IFundSourceRepository
{
    private readonly ApplicationDbContext dbContext;

    public FundSourceRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public IQueryable<Domain.Entities.Planning.FundSource> GetAllWithNavigation()
    {
        return dbContext.FundSources!
            .AsNoTracking()
            .Include(fs => fs.ParentSource)
            .Include(fs => fs.FiscalYear)
            .Where(fs => !fs.IsDeleted);
    }
}
