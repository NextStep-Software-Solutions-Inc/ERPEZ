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

        var externalSubject = currentUserService.ExternalIdentityId;
        var lookupSubject = !string.IsNullOrWhiteSpace(externalSubject) ? externalSubject : currentUserService.UserId;
        Expression<Func<Tenant, bool>> customFilter;

        if (currentUserService.IsSuperAdmin)
        {
            customFilter = t => !t.IsDeleted && !t.IsDisabled;
        }
        else if (string.IsNullOrWhiteSpace(lookupSubject))
        {
            var defaultId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            customFilter = t => t.Id == defaultId;
        }
        else
        {
            customFilter = t => !t.IsDisabled && t.TenantMembers.Any(tm =>
                (tm.ExternalIdentityId == lookupSubject || tm.UserId == lookupSubject) &&
                tm.Status == ERPEZ.TenantManagement.Domain.Enums.Status.Active &&
                !tm.IsDeleted);
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
            TenantMembers = t.TenantMembers
                .Where(tm => (tm.ExternalIdentityId == lookupSubject || tm.UserId == lookupSubject) &&
                             tm.Status == ERPEZ.TenantManagement.Domain.Enums.Status.Active &&
                             !tm.IsDeleted)
                .Select(tm => new TenantMemberDto
                {
                    Id = tm.Id,
                    TenantId = tm.TenantId,
                    Role = tm.RoleAssignments.Select(ra => ra.Role.Name).FirstOrDefault(),
                    Roles = tm.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
                    RoleIds = tm.RoleAssignments.Select(ra => ra.RoleId).ToList(),
                    Status = tm.Status.ToString()
                }).ToList(),
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
