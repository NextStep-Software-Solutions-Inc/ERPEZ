using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool OnPremise { get; set; }
    public required string BillingContactEmail { get; set; }
}
