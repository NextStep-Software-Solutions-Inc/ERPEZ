using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IDirectAcquisitionRepository : IRepository<DirectAcquisition>
{
    Task<DirectAcquisition?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DirectAcquisition?> GetByIdWithConsolidatedPRAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<DirectAcquisition>> GetApprovedAvailableForPOAsync(IEnumerable<Guid> excludedIds, CancellationToken cancellationToken = default);
}
