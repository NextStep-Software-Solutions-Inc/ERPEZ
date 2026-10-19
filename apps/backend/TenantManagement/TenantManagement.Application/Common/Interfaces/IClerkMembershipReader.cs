using ERPEZ.TenantManagement.Application.Common.Models;

namespace ERPEZ.TenantManagement.Application.Common.Interfaces;

public interface IClerkMembershipReader
{
    Task<ClerkMembershipDto?> GetMembershipAsync(string externalOrgId, string externalUserId, CancellationToken ct = default);
}
