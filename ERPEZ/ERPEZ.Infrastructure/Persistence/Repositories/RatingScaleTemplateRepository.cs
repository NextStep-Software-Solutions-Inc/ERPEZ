using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class RatingScaleTemplateRepository : Repository<Domain.Entities.Planning.RatingScaleTemplate>, IRatingScaleTemplateRepository
{
    private readonly ApplicationDbContext context;

    public RatingScaleTemplateRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<Domain.Entities.Planning.RatingScaleTemplate?> GetTemplateWithLevelsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.RatingScaleTemplate>()
            .Include(r => r.RatingScaleLevels)
            .Include(r => r.GeneralRatingScale)
            .FirstOrDefaultAsync(r => EF.Property<Guid>(r, "Id") == id, cancellationToken);
    }
}
