namespace ERPEZ.TenantManagement.Application.Common.Models;

public record ClerkMembershipDto(
    string ExternalOrgId,
    string ExternalUserId,
    string Role,
    bool IsActive
);
