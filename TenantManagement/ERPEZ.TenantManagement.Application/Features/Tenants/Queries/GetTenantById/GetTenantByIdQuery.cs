using ERPEZ.TenantManagement.Domain.Entities;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById
{
    public record GetTenantByIdQuery(Guid Id) : IRequest<Tenant?>;
}