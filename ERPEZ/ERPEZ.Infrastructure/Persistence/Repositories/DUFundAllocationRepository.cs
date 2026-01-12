using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DUFundAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.DUFundAllocation>(context, sieveProcessor),
      Domain.Interfaces.IDUFundAllocationRepository
{
    private readonly ApplicationDbContext context = context;
    private readonly ISieveProcessor sieveProcessor = sieveProcessor;

    public override async Task<(IReadOnlyList<Domain.Entities.Planning.DUFundAllocation> Entities, int TotalCount)> GetAllAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUFundAllocation> query = context.Set<Domain.Entities.Planning.DUFundAllocation>()
            .AsNoTracking()
            .Include(dufa => dufa.ReceivedFund)
                .ThenInclude(rf => rf.FundSource);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public override async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllAsync<TDto>(SieveModel sieveModel, Expression<Func<Domain.Entities.Planning.DUFundAllocation, TDto>> projection, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUFundAllocation> query = context.Set<Domain.Entities.Planning.DUFundAllocation>()
            .AsNoTracking()
            .Include(dufa => dufa.ReceivedFund)
                .ThenInclude(rf => rf.FundSource);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}
