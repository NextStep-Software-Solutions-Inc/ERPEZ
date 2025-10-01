using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;

public sealed class GetTenantByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetTenantByIdQuery, Tenant?>
{
    public async Task<Tenant?> Handle(
        GetTenantByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.FindAsync(
           t => t.Id == request.Id && !t.IsDeleted,
            cancellationToken: cancellationToken);

        return tenant;
    }
}