using ERPEZ.TenantManagement.Domain.Enums;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;

public class ToggleTenantMemberStatusDto
{
    public Status Status { get; set; }
    public Guid ConcurrencyStamp { get; set; }
}
