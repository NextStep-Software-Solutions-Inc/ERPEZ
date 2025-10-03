using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

public sealed class UpdateTenantCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTenantCommand, ApiResponse<Tenant>>
{
    public async Task<ApiResponse<Tenant>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        
        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant not found.");
       
        if (tenant.Name == request.UpdateTenant?.Name && tenant.BillingContactEmail == request.UpdateTenant?.BillingContactEmail) 
        {
            throw new ConflictException("No changes detected to update.");
        }

        tenant.Name = request.UpdateTenant?.Name ?? tenant.Name;
        tenant.BillingContactEmail = request.UpdateTenant?.BillingContactEmail ?? tenant.BillingContactEmail;
        tenant.OnPremise = request.UpdateTenant?.OnPremise ?? tenant.OnPremise;

        unitOfWork.TenantRepository.Update(tenant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Tenant>
        {
            Succeeded = true,
            Message = "Updated Successfully.",
            Data = tenant
        };
    }
}