using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProjectDocumentChecklistRepository : Repository<ProjectDocumentChecklist>, IProjectDocumentChecklistRepository
{
    private readonly ApplicationDbContext context;

    public ProjectDocumentChecklistRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<ProjectDocumentChecklist>> GetByProjectIdAsync(
        Guid projectId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProjectDocumentChecklist>()
            .Where(c => c.ProcurementProjectId == projectId && !c.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProjectDocumentChecklist?> GetByIdWithMasterTypeAsync(
        Guid id, Guid procurementProjectId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProjectDocumentChecklist>()
            .AsNoTracking()
            .Include(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(c =>
                c.Id == id && c.ProcurementProjectId == procurementProjectId && !c.IsDeleted,
                cancellationToken);
    }
}