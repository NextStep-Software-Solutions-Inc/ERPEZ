using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

public sealed class UpdateTenantCommand : IRequest<ApiResponse<Tenant>>
{
    public Guid Id { get; set; }
    public UpdateTenantDto? UpdateTenant { get; set; }
}