using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface INoticeToProceedRepository : IRepository<NoticeToProceed>
{
    IQueryable<NoticeToProceed> QueryWithDetails();
    Task<NoticeToProceed?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NoticeToProceed?> GetByContractIdWithDetailsAsync(Guid contractId, CancellationToken cancellationToken = default);
    Task<bool> ExistsActiveForContractAsync(Guid contractId, CancellationToken cancellationToken = default);
}
