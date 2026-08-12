using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APPPPMPRepository : Repository<APPPPMP>, IAPPPPMPRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APPPPMPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<List<APPPPMP>> GetByAPPAsync(
        Guid appId,
        Expression<Func<APPPPMP, object>>[]? includes = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Set<APPPPMP>()
            .AsNoTracking()
            .Where(s => s.APPId == appId && !s.IsDeleted);

        // Default include: PPMP and related details
        if (includes == null)
        {
            query = query.Include(s => s.PPMP);
        }
        else
        {
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetByAPPAsync<TDto>(
        Guid appId,
        SieveModel sieveModel,
        Expression<Func<APPPPMP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = context.Set<APPPPMP>()
            .AsNoTracking()
            .Where(s => s.APPId == appId && !s.IsDeleted)
            .Include(s => s.PPMP);

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var entities = await sieveProcessor
            .Apply(sieveModel, filteredQuery)
            .Select(projection)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<bool> ExistsInAPPAsync(Guid appId, Guid ppmpId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APPPPMP>()
            .AnyAsync(s => s.APPId == appId && s.PPMPId == ppmpId && !s.IsDeleted, cancellationToken);
    }

    public async Task<List<PPMP>> GetAllLinkedPPMPsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<APPPPMP>()
            .Where(s => !s.IsDeleted)
            .Include(s => s.PPMP)
            .Select(s => s.PPMP!)
            .Distinct()
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Guid>> GetLinkedPPMPIdsAsync(Guid appId, IEnumerable<Guid> ppmpIds, CancellationToken cancellationToken = default)
    {
        var idList = ppmpIds.ToList();
        return await context.Set<APPPPMP>()
            .Where(ap => ap.APPId == appId && idList.Contains(ap.PPMPId) && !ap.IsDeleted)
            .Select(ap => ap.PPMPId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<APPPPMP>> GetLinksByAppAndPpmpIdsAsync(Guid appId, IEnumerable<Guid> ppmpIds, CancellationToken cancellationToken = default)
    {
        var idList = ppmpIds.ToList();
        return await context.Set<APPPPMP>()
            .Where(ap => ap.APPId == appId && (idList.Contains(ap.PPMPId) || idList.Contains(ap.Id)) && !ap.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
