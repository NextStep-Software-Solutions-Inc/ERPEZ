using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PMTMemberRepository : Repository<PMTMember>, IPMTMemberRepository
{
    private readonly ApplicationDbContext dbContext;

    public PMTMemberRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<List<PMTMember>> GetByPMTIdAsync(Guid pmtId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTMembers!
            .Include(pm => pm.PMT)
            .Where(pm => pm.PMTId == pmtId && !pm.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsUserInPMTAsync(Guid pmtId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTMembers!
            .AnyAsync(pm => pm.PMTId == pmtId && pm.UserId == userId && pm.IsActive && !pm.IsDeleted, cancellationToken);
    }

    public async Task<List<PMTMember>> GetActiveByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTMembers!
            .Include(pm => pm.PMT)
            .ThenInclude(p => p!.Organization)
            .Where(pm => pm.UserId == userId && pm.IsActive && !pm.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<PMTMember?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.PMTMembers!
            .Include(pm => pm.User)
                .ThenInclude(u => u!.Office)
            .Include(pm => pm.PMT)
                .ThenInclude(p => p!.Organization)
            .FirstOrDefaultAsync(pm => pm.Id == id && !pm.IsDeleted, cancellationToken);
    }
}
