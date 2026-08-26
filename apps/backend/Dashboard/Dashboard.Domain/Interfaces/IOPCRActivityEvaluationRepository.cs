using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRActivityEvaluationRepository : IRepository<OPCRActivityEvaluation>
{
    Task<OPCRActivityEvaluation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
