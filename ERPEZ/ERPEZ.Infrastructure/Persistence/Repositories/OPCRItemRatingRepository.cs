// ERPEZ.Infrastructure/Persistence/Repositories/OPCRItemRatingRepository.cs
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRItemRatingRepository : Repository<OPCRItemRating>, IOPCRItemRatingRepository
{
    private readonly ApplicationDbContext context;

    public OPCRItemRatingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<OPCRItemRating>> GetByOPCRItemIdAsync(
        Guid opcrItemId, CancellationToken cancellationToken = default)
    {
        return await context.Set<OPCRItemRating>()
            .Where(x => x.OPCRItemId == opcrItemId && !x.IsDeleted)
            .Include(x => x.KPIMeasurement)
            .ToListAsync(cancellationToken);
    }
}