using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, ApiResponse<Tenant>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<Tenant>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenantExist = await _unitOfWork.TenantRepository.FindAsync(
            t => t.Name == request.Name && t.BillingContactEmail == request.BillingContactEmail && !t.IsDeleted
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

        await _tenantRepository.AddAsync(tenant, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Tenant>
        {
            Data = tenant,
            Succeeded = true,
            Message = "Tenant created successfully."
        };
    }
}
