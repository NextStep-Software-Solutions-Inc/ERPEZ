using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommand : IRequest<ApiResponse<TenantDto>>
{
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public bool OnPremise { get; set; }
    public required string BillingContactEmail { get; set; }
}
