using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IContractRepository : IRepository<Contract>
{
    IQueryable<Contract> QueryWithDetails();
    Task<Contract?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsActiveForNoaAsync(Guid noaId, CancellationToken cancellationToken = default);
}
