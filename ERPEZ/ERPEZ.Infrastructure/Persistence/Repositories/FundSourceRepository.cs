using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FundSourceRepository : Repository<Domain.Entities.Planning.FundSource>, Domain.Interfaces.IFundSourceRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public FundSourceRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public IQueryable<Domain.Entities.Planning.FundSource> GetAllWithNavigation()
    {
        return dbContext.FundSources!
            .AsNoTracking()
            .Include(fs => fs.ParentSource)
            .Include(fs => fs.FiscalYear)
            .Where(fs => !fs.IsDeleted);
    }

    public async Task<(List<Domain.Entities.Planning.FundSource> Items, int TotalCount)> GetPagedWithNavigationAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = GetAllWithNavigation();

        var validatedPage = sieveModel.Page.GetValueOrDefault(1);
        if (validatedPage < 1)
            validatedPage = 1;

        var validatedPageSize = sieveModel.PageSize.GetValueOrDefault(10);
        if (validatedPageSize <= 0)
            validatedPageSize = 10;

        var normalizedSieveModel = new SieveModel
        {
            Filters = sieveModel.Filters,
            Sorts = sieveModel.Sorts,
            Page = validatedPage,
            PageSize = validatedPageSize
        };

        var filteredQuery = sieveProcessor.Apply(normalizedSieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var orderedQuery = string.IsNullOrWhiteSpace(normalizedSieveModel.Sorts)
            ? filteredQuery.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
            : filteredQuery;

        var items = await orderedQuery
            .Skip((validatedPage - 1) * validatedPageSize)
            .Take(validatedPageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
