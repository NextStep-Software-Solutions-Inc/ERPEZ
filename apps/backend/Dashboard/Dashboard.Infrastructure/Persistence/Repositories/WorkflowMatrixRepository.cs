using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WorkflowMatrixRepository : Repository<WorkflowMatrix>, IWorkflowMatrixRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public WorkflowMatrixRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.WorkflowMatrices!
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.RecommendingApproverPosition)
            .Include(x => x.FinalApproverPosition)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }

    public IQueryable<WorkflowMatrix> GetAllWithNavigation()
    {
        return dbContext.WorkflowMatrices!
            .AsNoTracking()
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.RecommendingApproverPosition)
            .Include(x => x.FinalApproverPosition)
            .Where(x => !x.IsDeleted);
    }

    public async Task<(List<WorkflowMatrix> Items, int TotalCount)> GetPagedWithNavigationAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
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
