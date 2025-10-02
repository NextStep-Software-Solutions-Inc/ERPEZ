using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateTenantCommand, ApiResponse<Tenant>>
{
    public async Task<ApiResponse<Tenant>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenantExist = await _unitOfWork.TenantRepository.FindAsync(
            t => t.Name == request.Name && t.BillingContactEmail == request.BillingContactEmail, cancellationToken : cancellationToken
        );

        if (tenantExist != null)
        {
            return new ApiResponse<Tenant>
            {
                Succeeded = false,
                Data = null,
                Message = "Tenant already exists."
            };
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            OnPremise = request.OnPremise,
            BillingContactEmail = request.BillingContactEmail,
            TenantSetting = new TenantSetting
            {
                Name = "",
                BillingContactEmail = request.BillingContactEmail,
                BaseURL = "",
                DbConnectionString = ""

            }
        };

        tenant.TenantSubscriptions.Add(new TenantSubscription
        {
            Amount = 0,
            Plan = 5,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            Status = 1,
            AutoRenew = false
        });

        var module = await _unitOfWork.ModuleRepository.FindAsync(m => m.Name == "AMS", cancellationToken: cancellationToken);

        if (module != null) tenant.Modules.Add(module);

        await _unitOfWork.TenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Tenant>
        {
            Data = tenant,
            Succeeded = true,
            Message = "Tenant created successfully."
        };
    }
}
