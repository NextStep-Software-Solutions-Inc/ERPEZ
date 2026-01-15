using ERPEZ.Domain.Entities.Core;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UserPINRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<UserPIN>(context, sieveProcessor), IUserPINRepository
{
    private readonly ApplicationDbContext context = context;
    public async Task<UserPIN?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await context.Set<UserPIN>()
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }
}
