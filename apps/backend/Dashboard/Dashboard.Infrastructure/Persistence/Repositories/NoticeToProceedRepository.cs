using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NoticeToProceedRepository : Repository<NoticeToProceed>, INoticeToProceedRepository
{
    private readonly ApplicationDbContext context;

    public NoticeToProceedRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public IQueryable<NoticeToProceed> QueryWithDetails()
    {
        return context.NoticeToProceeds!
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.Supplier)
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.ProcurementProject)
                        .ThenInclude(p => p.ProcurementMode);
    }

    public async Task<NoticeToProceed?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.NoticeToProceeds!
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.Supplier)
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.ProcurementProject)
                        .ThenInclude(p => p.ProcurementMode)
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.BACResolution)
            .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted, cancellationToken);
    }

    public async Task<NoticeToProceed?> GetByContractIdWithDetailsAsync(Guid contractId, CancellationToken cancellationToken = default)
    {
        return await context.NoticeToProceeds!
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.Supplier)
            .Include(n => n.Contract)
                .ThenInclude(c => c.NoticeOfAward)
                    .ThenInclude(noa => noa.ProcurementProject)
                        .ThenInclude(p => p.ProcurementMode)
            .FirstOrDefaultAsync(n => n.ContractId == contractId && n.Status != NoticeToProceedStatus.Cancelled && !n.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsActiveForContractAsync(Guid contractId, CancellationToken cancellationToken = default)
    {
        return await context.NoticeToProceeds!
            .AnyAsync(n => n.ContractId == contractId && n.Status != NoticeToProceedStatus.Cancelled && !n.IsDeleted, cancellationToken);
    }
}
