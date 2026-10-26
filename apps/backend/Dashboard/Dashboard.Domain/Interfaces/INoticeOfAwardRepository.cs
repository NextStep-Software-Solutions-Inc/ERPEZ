using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface INoticeOfAwardRepository : IRepository<NoticeOfAward>
{
    IQueryable<NoticeOfAward> QueryWithDetails();
    Task<List<NoticeOfAward>> GetApprovedAvailableForPOAsync(IEnumerable<Guid> excludedIds, CancellationToken cancellationToken = default);
}
