using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IAOBRepository : IRepository<AOB>
{
    Task<AOB?> GetByIdWithAwardedItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<AOB>> GetApprovedAvailableForPOAsync(IEnumerable<Guid> excludedIds, CancellationToken cancellationToken = default);
}
