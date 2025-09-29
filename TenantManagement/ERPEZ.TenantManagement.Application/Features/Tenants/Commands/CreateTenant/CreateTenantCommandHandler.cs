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
        var tenantExist = await _unitOfWork.TenantRepository.FindAsync(t => t.Name == request.Name && t.BillingContactEmail == request.BillingContactEmail && !t.IsDeleted);
        if (tenantExist != null) 
        {
            return new()
            {
               Succeeded = false,
               Data = null,
               Message = "Tenant already exist."
            };
        }
        var tenant = new Tenant
        {
            Name = request.Name,
            OnPremise = request.OnPremise,
            BillingContactEmail = request.BillingContactEmail
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return new()
        {
            Data = tenant,
            Succeeded = true,
            Message = "Tenant created successfully."
        };
    }
}
