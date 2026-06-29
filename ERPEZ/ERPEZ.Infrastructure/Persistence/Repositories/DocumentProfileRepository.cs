using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DocumentProfileRepository
    : Repository<DocumentProfile>, IDocumentProfileRepository
{
    private readonly ApplicationDbContext context;

    public DocumentProfileRepository(
        ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor) => this.context = context;

    public async Task<DocumentProfile?> GetByIdWithItemsAsync(
        Guid id, CancellationToken cancellationToken = default) =>
        await context.Set<DocumentProfile>()
            .Include(p => p.DocumentProfileItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.MasterDocumentType)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
}