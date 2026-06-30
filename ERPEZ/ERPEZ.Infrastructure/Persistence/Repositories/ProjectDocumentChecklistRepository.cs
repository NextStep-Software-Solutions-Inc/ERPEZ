using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProjectDocumentChecklistRepository
    : Repository<ProjectDocumentChecklist>, IProjectDocumentChecklistRepository
{
    private readonly ApplicationDbContext context;

    public ProjectDocumentChecklistRepository(
        ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor) => this.context = context;

    public async Task<List<ProjectDocumentChecklist>> GetByProjectIdAsync(
        Guid projectId, CancellationToken cancellationToken = default) =>
        await context.Set<ProjectDocumentChecklist>()
            .Include(c => c.MasterDocumentType)
            .Where(c => c.ProcurementProjectId == projectId && !c.IsDeleted)
            .OrderBy(c => c.EnvelopeType)
            .ThenBy(c => c.OrderIndex)
            .ToListAsync(cancellationToken);
}