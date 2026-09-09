using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantsByMe;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

public class GetMyTenantsQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMyTenantsQuery, PaginatedApiResponse<TenantDto>>
{
    public async Task<PaginatedApiResponse<TenantDto>> Handle(GetMyTenantsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var userId = currentUserService.UserId;
        var extId = currentUserService.ExternalIdentityId;
        Expression<Func<Tenant, bool>> customFilter;

        if (string.IsNullOrWhiteSpace(userId) && string.IsNullOrWhiteSpace(extId))
        {
            var defaultId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            customFilter = t => t.Id == defaultId;
        }
        else
        {
            customFilter = t => t.TenantMembers.Any(tm =>
                (!string.IsNullOrEmpty(userId) && tm.UserId == userId) ||
                (!string.IsNullOrEmpty(extId) && tm.ExternalIdentityId == extId) ||
                (!string.IsNullOrEmpty(extId) && tm.UserId == extId));
        }

        Expression<Func<Tenant, TenantDto>> projection = t => new()
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            IsDisabled = t.IsDisabled,
            TenantSetting = new()
            {
                Id = t.TenantSetting.Id,
                OnPremise = t.TenantSetting.OnPremise,
                BaseURL = t.TenantSetting.BaseURL,
                DbConnectionString = t.TenantSetting.DbConnectionString,
                BillingContactEmail = t.TenantSetting.BillingContactEmail,
                AllowedDomain = t.TenantSetting.AllowedDomain,
                MaxAllowedTenants = t.TenantSetting.MaxAllowedTenants
            },
            TenantSubscriptions = t.TenantSubscriptions
                .Where(ts => ts.TenantId == t.Id)
                .Select(ts => new TenantSubscriptionDto
                {
                    Id = ts.Id,
                    Amount = ts.Amount,
                    Plan = ts.Plan.ToString(),
                    Status = ts.Status.ToString(),
                    BillingCycle = ts.BillingCycle.ToString(),
                    StartDate = ts.StartDate,
                    EndDate = ts.EndDate,
                    AutoRenew = ts.AutoRenew
                })
                .ToList(),
            Modules = t.Modules.Select(m => new TenantModuleDto
            {
                Id = m.Id,
                Key = m.Key,
                Name = m.Name,
                Description = m.Description,
                IsActive = m.IsActive
            }).ToList()
        };

        var (tenantDtos, totalCount) = await unitOfWork.TenantRepository.GetAllAsync(sieveModel, projection, customFilter, cancellationToken);

        return new PaginatedApiResponse<TenantDto>(
            [.. tenantDtos],
            query.PageNumber,
            query.PageSize,
            totalCount);

    }
}
