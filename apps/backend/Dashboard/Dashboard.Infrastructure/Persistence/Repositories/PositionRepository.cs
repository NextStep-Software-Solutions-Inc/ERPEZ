using Microsoft.EntityFrameworkCore;
using Sieve.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PositionRepository : Repository<Position>, IPositionRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public PositionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<int> CountByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await dbContext.Positions!
            .CountAsync(p => p.OperationalStatus == status, cancellationToken);
    }

    public async Task<int> CountAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Positions!.CountAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Position>, int)> GetAllWithDetailsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Positions!
            .Include(p => p.PositionType)
            .Include(p => p.PlantillaType)
            .Include(p => p.SalaryGrade)
            .Include(p => p.Step)
            .Include(p => p.Office)
            .Where(p => !p.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }

    public async Task<Position?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Positions!
            .Include(p => p.PositionType)
            .Include(p => p.PlantillaType)
            .Include(p => p.SalaryGrade)
            .Include(p => p.Step)
            .Include(p => p.Office)
            .Where(p => p.Id == id && !p.IsDeleted)
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);
    }
}
