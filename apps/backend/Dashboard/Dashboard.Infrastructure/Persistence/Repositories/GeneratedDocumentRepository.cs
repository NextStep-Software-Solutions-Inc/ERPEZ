using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class GeneratedDocumentRepository
    : Repository<GeneratedDocument>, IGeneratedDocumentRepository
{
    private readonly ApplicationDbContext dbContext;

    public GeneratedDocumentRepository(
        ApplicationDbContext context,
        ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<List<GeneratedDocument>> GetByOfficeAsync(
        Guid officeId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<GeneratedDocument>()
            .Where(d => d.OfficeId == officeId && !d.IsDeleted)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}