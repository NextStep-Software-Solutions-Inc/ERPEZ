using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementActivityTypeRepository : Repository<ProcurementActivityType>, IProcurementActivityTypeRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public ProcurementActivityTypeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        // Assigned the fields here to match your format
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<bool> ExistsWithSystemRoleAsync(
        ProcurementActivitySystemRole role, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementActivityType>()
            .AnyAsync(t => t.SystemRole == role, cancellationToken);
    }
}