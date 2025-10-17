using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateTenantCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenantExist = await _unitOfWork.TenantRepository.FindAsync(
            t => t.Name == request.Name && t.BillingContactEmail == request.BillingContactEmail, cancellationToken
        );
        if (tenantExist != null) throw new ConflictException("Tenant already exists.");

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

        var module = await _unitOfWork.ModuleRepository.FindAsync(m => m.Key == "ams", cancellationToken: cancellationToken);
        if (module != null) tenant.Modules.Add(module);

        await _unitOfWork.TenantRepository.AddAsync(tenant, cancellationToken);

        var tenantMember = new TenantMember
        {
            UserId = request.UserId,
            Role = TenantMemberRole.Owner,
            Status = Status.Active
        };
        tenant.TenantMembers.Add(tenantMember);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(tenant.Id, "Tenant created successfully.");
    }
}
