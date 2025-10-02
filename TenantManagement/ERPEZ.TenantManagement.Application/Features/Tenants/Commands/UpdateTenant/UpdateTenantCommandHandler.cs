    using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

public sealed class UpdateTenantCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTenantCommand, ApiResponse<Tenant>>
{
    public async Task<ApiResponse<Tenant>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (tenant == null)
        {
            return new ApiResponse<Tenant>
            {
                Succeeded = false,
                Message = "Tenant not found.",
                Data = null
            };
        }
        if (tenant.Name == request.UpdateTenant?.Name && tenant.BillingContactEmail == request.UpdateTenant?.BillingContactEmail)
        {
            return new ApiResponse<Tenant>
            {
                Succeeded = false,
                Message = "Tenant already exist.",
                Data = tenant
            };
        }
        // 2. Apply changes from the command to the domain entity
        tenant.Name = string.IsNullOrWhiteSpace(request.UpdateTenant?.Name)
            ? tenant.Name
            : request.UpdateTenant.Name;

        tenant.BillingContactEmail = string.IsNullOrWhiteSpace(request.UpdateTenant?.BillingContactEmail)
            ? tenant.BillingContactEmail
            : request.UpdateTenant.BillingContactEmail;

        tenant.OnPremise = request.UpdateTenant?.OnPremise ?? tenant.OnPremise;


        await unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Return MediatR's void equivalent (Unit.Value)
        return new ApiResponse<Tenant>
        {
            Succeeded = true,
            Message = "Updated Successfully.",
            Data = tenant
        };
    }
}