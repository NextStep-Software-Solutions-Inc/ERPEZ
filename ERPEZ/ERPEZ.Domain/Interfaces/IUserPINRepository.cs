using ERPEZ.Domain.Entities.Core;

namespace ERPEZ.Domain.Interfaces;

public interface IUserPINRepository : IRepository<UserPIN>
{
    Task<UserPIN?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
