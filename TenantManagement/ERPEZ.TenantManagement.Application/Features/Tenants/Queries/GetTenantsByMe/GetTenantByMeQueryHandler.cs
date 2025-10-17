using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantsByMe;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetTenantByMeQueryHandler(IUnitOfWork UnitOfWork)
    : IRequestHandler<GetTenantByMeQuery, ApiResponse<IReadOnlyList<TenantDto>>>
{
    public async Task<ApiResponse<IReadOnlyList<TenantDto>>> Handle(GetTenantByMeQuery request, CancellationToken cancellationToken)
    {
        var tenantQuery = UnitOfWork.TenantRepository
            .Query()
            .Where(t => t.TenantMembers.Any(tm => tm.UserId == request.UserId))
            .Select(t => new TenantDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                TenantSetting = new TenantSettingDto
                {
                    Id = t.TenantSetting.Id,
                    OnPremise = t.TenantSetting.OnPremise,
                    BaseURL = t.TenantSetting.BaseURL,
                    DbConnectionString = t.TenantSetting.DbConnectionString,
                    BillingContactEmail = t.TenantSetting.BillingContactEmail
                },

                TenantSubscriptions = t.TenantSubscriptions
                    .Where(ts => ts.TenantId == t.Id)
                    .Select(ts => new TenantSubscriptionDto
                        {
                            Id = ts.Id,
                            TenantId = ts.TenantId,
                            Amount = ts.Amount,
                            Plan = ts.Plan.ToString(),
                            Status = ts.Status.ToString(),
                            BillingCycle = ts.BillingCycle.ToString(),
                            StartDate = ts.StartDate,
                            EndDate = ts.EndDate,
                            AutoRenew = ts.AutoRenew
                        }).ToList(),

                TenantMembers = t.TenantMembers
                    .Where(tm => tm.TenantId == t.Id)
                    .Select(tm => new TenantMemberDto
                    {
                        Id = tm.Id,
                        UserId = tm.UserId,
                        Role = tm.Role.ToString(),
                        Status = tm.Status.ToString()
                    })
                    .ToList()
            });

        var tenants = await tenantQuery.ToListAsync(cancellationToken);

        if (tenants.Count == 0)
        {
            throw new NotFoundException("No tenants found for the user.");
        }

        return ApiResponse<IReadOnlyList<TenantDto>>.Success(tenants, "Tenants retrieved successfully.");
    }
}
