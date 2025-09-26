using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

public class UpdateTenantCommand : IRequest<ApiResponse<Tenant>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BillingContactEmail { get; set; } = string.Empty;
    public bool OnPremise { get; set; }
}