using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IPRItemRepository : IRepository<PRItem>
{
    Task<List<PRItem>> GetByIdsWithPPMPItemAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default);
}