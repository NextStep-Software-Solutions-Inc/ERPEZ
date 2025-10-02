using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenants;

public sealed class GetTenantsQueryHandler (IUnitOfWork unitOfWork) : IRequestHandler<GetTenantsQuery, PaginatedApiResponse<TenantDto>>
{
    public async Task<PaginatedApiResponse<TenantDto>> Handle(GetTenantsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (tenants, totalCount) = await unitOfWork.TenantRepository.GetAllAsync(sieveModel, isDeleted: false,
            include: q => q
                .Include(t => t.TenantSetting)
                .Include(t => t.TenantSubscriptions)
                .Include(t => t.Modules),
            cancellationToken: cancellationToken);
        var tenantDtos = tenants.Select(t => new TenantDto
        {
            Id = t.Id,
            Name = t.Name,
            OnPremise = t.OnPremise,
            BillingContactEmail = t.BillingContactEmail,
            TenantSetting = t.TenantSetting is not null ? new TenantSettingDto
            {
                Id = t.TenantSetting.Id,
                Name = t.TenantSetting.Name,
                BaseURL = t.TenantSetting.BaseURL,
                DbConnectionString = t.TenantSetting.DbConnectionString,
                BillingContactEmail = t.TenantSetting.BillingContactEmail
            } : null,
            TenantSubscriptions = [.. t.TenantSubscriptions.Select(ts => new TenantSubscriptionDto
            {
                Id = ts.Id,
                Amount = ts.Amount,
                Plan = ((TenantSubscriptionPlanEnum)ts.Plan).ToString(),
                Status = ((TenantSubscriptionStatusEnum)ts.Status).ToString(),
                BillingCycle = ts.BillingCycle == 0
                    ? ((TenantSubscriptionBillingCycleEnum)ts.BillingCycle != 0).ToString()
                    : string.Empty,
                StartDate = ts.StartDate,
                EndDate = ts.EndDate,
                AutoRenew = ts.AutoRenew
            })]
        }).ToList();

        return new PaginatedApiResponse<TenantDto>(
            tenantDtos,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
