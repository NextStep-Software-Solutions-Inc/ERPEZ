using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    private readonly ApplicationDbContext dbContext;

    public UserRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<User?> GetByExternalIdentityIdAsync(string externalIdentityId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .Include(u => u.PersonnelPositions)
                .ThenInclude(pp => pp.Position)
            .FirstOrDefaultAsync(u => u.ExternalIdentityId == externalIdentityId && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }

    public async Task<User?> GetByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .FirstOrDefaultAsync(u => u.EmployeeNumber == employeeNumber && !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .AnyAsync(u => u.Username == username && !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .AnyAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);
    }

    public async Task<bool> EmployeeNumberExistsAsync(string employeeNumber, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .AnyAsync(u => u.EmployeeNumber == employeeNumber && !u.IsDeleted, cancellationToken);
    }

    public async Task<List<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .Where(u => u.IsActive && !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<User>> GetByOfficeIdAsync(Guid officeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
            .Where(u => u.OfficeId == officeId && !u.IsDeleted)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetByIdWithOfficeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users!
            .Include(u => u.Office)
                .ThenInclude(o => o!.Organization)
            .Include(u => u.PersonnelPositions)
                .ThenInclude(pp => pp.Position)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
    }
}
