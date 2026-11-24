using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MasterDocumentTypeRepository
    : Repository<MasterDocumentType>, IMasterDocumentTypeRepository
{
    private readonly ApplicationDbContext context;

    public MasterDocumentTypeRepository(
        ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor) => this.context = context;

    public async Task<MasterDocumentType?> GetByIdWithItemsAsync(
        Guid id, CancellationToken cancellationToken = default) =>
        await context.Set<MasterDocumentType>()
            .Include(d => d.DocumentProfileItems.Where(i => !i.IsDeleted))
            .Include(d => d.ProjectDocumentChecklists.Where(c => !c.IsDeleted))
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken);

    public async Task<bool> IsNameDuplicateAsync(
        string name, Guid? excludeId = null, CancellationToken cancellationToken = default) =>
        await context.Set<MasterDocumentType>()
            .AnyAsync(d => !d.IsDeleted
                        && d.Name == name
                        && (excludeId == null || d.Id != excludeId),
                      cancellationToken);
}