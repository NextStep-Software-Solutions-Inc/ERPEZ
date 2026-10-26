using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PersonnelPositionRepository : Repository<PersonnelPosition>, IPersonnelPositionRepository
{
    private readonly ApplicationDbContext dbContext;

    public PersonnelPositionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<List<PersonnelPosition>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .Include(pp => pp.Position)
            .Where(pp => pp.UserId == userId && pp.IsActive && !pp.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<PersonnelPosition>> GetByPositionIdAsync(Guid positionId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .Include(pp => pp.Position)
            .Where(pp => pp.PositionId == positionId && !pp.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasActiveAssignmentAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .AnyAsync(pp => pp.UserId == userId && pp.IsActive && !pp.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasActiveAssignmentAsync(Guid userId, Guid positionId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .AnyAsync(pp => pp.UserId == userId && pp.PositionId == positionId && pp.IsActive && !pp.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasAnyActiveAssignmentForPositionAsync(Guid positionId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .AnyAsync(pp => pp.PositionId == positionId && pp.IsActive && !pp.IsDeleted, cancellationToken);
    }

    public async Task<PersonnelPosition?> GetByIdWithIncludesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.PersonnelPositions!
            .Include(pp => pp.User)
                .ThenInclude(u => u!.Office)
            .Include(pp => pp.Position)
                .ThenInclude(p => p!.Office)
            .FirstOrDefaultAsync(pp => pp.Id == id && !pp.IsDeleted, cancellationToken);
    }

    public async Task<PersonnelPosition?> GetActiveByPositionTitleAsync(string positionTitle, CancellationToken cancellationToken = default)
    {
        var lowerTitle = positionTitle.ToLower();
        return await dbContext.PersonnelPositions!
            .Include(pp => pp.User)
            .Include(pp => pp.Position)
            .FirstOrDefaultAsync(pp => pp.IsActive && !pp.IsDeleted && pp.Position != null &&
                (pp.Position.Title.ToLower().Contains(lowerTitle) ||
                 (pp.Position.FunctionalTitle != null && pp.Position.FunctionalTitle.ToLower().Contains(lowerTitle))), cancellationToken);
    }
}
