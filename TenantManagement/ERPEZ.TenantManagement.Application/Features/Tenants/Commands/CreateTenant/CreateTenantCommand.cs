using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommand : IRequest<ApiResponse<Tenant>>
{
    public required string Name { get; set; }
    public bool OnPremise { get; set; }
    public required string BillingContactEmail { get; set; }
}
