using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LIBAmendmentRequestRepository : Repository<LIBAmendmentRequest>, ILIBAmendmentRequestRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public LIBAmendmentRequestRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<LIBAmendmentRequest?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.LIBAmendmentRequests!
            .Include(x => x.LineItemBudget)
            .Include(x => x.ProposedLineItemBudget)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<LIBAmendmentRequest>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LIBAmendmentRequests!
            .Include(x => x.LineItemBudget)
            .Include(x => x.ProposedLineItemBudget)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<LIBAmendmentRequest>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.LIBAmendmentRequests!
            .Include(x => x.LineItemBudget)
            .Include(x => x.ProposedLineItemBudget)
            .Where(x => !x.IsDeleted)
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }
}