using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;

public sealed class GetTenantByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetTenantByIdQuery, ApiResponse<TenantDto>>
{
    public async Task<ApiResponse<TenantDto>> Handle(
        GetTenantByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.FindAsync(
           t => t.Id == request.Id && !t.IsDeleted,
            include: q => q
                .Include(t => t.TenantSetting)
                .Include(t => t.TenantSubscriptions)
                .Include(t => t.Modules),
            cancellationToken: cancellationToken);

        if (tenant == null)
            return new ApiResponse<TenantDto>
            {
                Succeeded = false,
                Data = null,
                Message = "Tenant not found."
            };

        var tenantDto = new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            OnPremise = tenant.OnPremise,
            BillingContactEmail = tenant.BillingContactEmail,
            TenantSetting = tenant.TenantSetting is not null ? new TenantSettingDto
            {
                Id = tenant.TenantSetting.Id,
                Name = tenant.TenantSetting.Name,
                BaseURL = tenant.TenantSetting.BaseURL,
                DbConnectionString = tenant.TenantSetting.DbConnectionString,
                BillingContactEmail = tenant.TenantSetting.BillingContactEmail
            } : null,
            TenantSubscriptions = [.. tenant.TenantSubscriptions.Select(ts => new TenantSubscriptionDto
            {
                Id = ts.Id,
                Amount = ts.Amount,
                Plan = ((TenantSubscriptionPlanEnum)ts.Plan).ToString(),
                Status = ((TenantSubscriptionStatusEnum)ts.Status).ToString(),
                BillingCycle = ((TenantSubscriptionBillingCycleEnum)ts.BillingCycle).ToString(),
                StartDate = ts.StartDate,
                EndDate = ts.EndDate,
                AutoRenew = ts.AutoRenew
            })]
        };

        return new ApiResponse<TenantDto>
        {
            Succeeded = true,
            Message = "Retrived Successfully.",
            Data = tenantDto
        };
    }
}