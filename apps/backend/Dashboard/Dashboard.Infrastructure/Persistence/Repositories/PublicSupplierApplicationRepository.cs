// PublicSupplierApplicationRepository.cs
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PublicSupplierApplicationRepository
    : Repository<PublicSupplierApplication>, IPublicSupplierApplicationRepository
{
    private readonly ApplicationDbContext context;

    public PublicSupplierApplicationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<PublicSupplierApplication?> GetWithDocumentsByIdAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<PublicSupplierApplication>()
            .AsNoTracking()
            .Include(a => a.ProcurementProject)
            .Include(a => a.UploadedDocuments)
                .ThenInclude(d => d.ChecklistItem)
                    .ThenInclude(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }
    public async Task<bool> ExistsAsync(Guid projectId, string tinNumber, CancellationToken cancellationToken)
    => await context.Set<PublicSupplierApplication>()
        .AnyAsync(a => a.ProcurementProjectId == projectId 
                    && a.TinNumber == tinNumber, cancellationToken);
}