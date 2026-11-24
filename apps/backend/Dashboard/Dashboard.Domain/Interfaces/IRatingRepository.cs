using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IRatingRepository : IRepository<Rating>
{
	Task<Rating?> GetByIdWithJoinAsync(Guid id, CancellationToken cancellationToken = default);
}
