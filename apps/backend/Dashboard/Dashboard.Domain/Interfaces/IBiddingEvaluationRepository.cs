using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IBiddingEvaluationRepository : IRepository<BiddingEvaluation>
{
    Task<BiddingEvaluation?> GetByProjectIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default);
}

