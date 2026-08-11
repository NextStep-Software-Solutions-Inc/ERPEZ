using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PMTRepository : Repository<PMT>, IPMTRepository
{
    private readonly ApplicationDbContext dbContext;

    public PMTRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<PMT?> GetByOrganizationAndYearAsync(Guid organizationId, int year, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTs!
            .Include(p => p.Organization)
            .Include(p => p.PMTMembers)
            .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.ActiveYear == year && !p.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsForOrganizationAndYearAsync(Guid organizationId, int year, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTs!
            .AnyAsync(p => p.OrganizationId == organizationId && p.ActiveYear == year && !p.IsDeleted, cancellationToken);
    }

    public async Task<PMT?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTs!
            .Include(p => p.Organization)
            .Include(p => p.PMTMembers)
                .ThenInclude(pm => pm.User)
                    .ThenInclude(u => u!.Office)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
    }
}
