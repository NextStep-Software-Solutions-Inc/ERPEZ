// ERPEZ.Infrastructure/Persistence/Repositories/OPCRItemMOVRepository.cs
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRItemMOVRepository : Repository<OPCRItemMOV>, IOPCRItemMOVRepository
{
    private readonly ApplicationDbContext context;

    public OPCRItemMOVRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<OPCRItemMOV>> GetByOPCRItemIdAsync(
        Guid opcrItemId, CancellationToken cancellationToken = default)
    {
        return await context.Set<OPCRItemMOV>()
            .Where(x => x.OPCRItemId == opcrItemId && !x.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}