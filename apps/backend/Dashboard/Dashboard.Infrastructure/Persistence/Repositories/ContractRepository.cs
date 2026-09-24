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

public class ContractRepository : Repository<Contract>, IContractRepository
{
    private readonly ApplicationDbContext context;

    public ContractRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public IQueryable<Contract> QueryWithDetails()
    {
        return context.Contracts!
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.Supplier)
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.ProcurementProject);
    }

    public async Task<Contract?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Contracts!
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.Supplier)
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.ProcurementProject)
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.Milestones)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);
    }

    public async Task<bool> ExistsActiveForNoaAsync(Guid noaId, CancellationToken cancellationToken = default)
    {
        return await context.Contracts!
            .AnyAsync(c => c.NoticeOfAwardId == noaId && c.Status != ContractStatus.Cancelled && !c.IsDeleted, cancellationToken);
    }
}
