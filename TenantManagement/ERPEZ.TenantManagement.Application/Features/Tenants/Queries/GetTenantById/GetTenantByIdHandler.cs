using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Tenants.Dtos;
using ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Queries.GetTenantById;

public sealed class GetTenantByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantByIdQuery, ApiResponse<TenantDto>>
{
    public async Task<ApiResponse<TenantDto>> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantQuery = unitOfWork.TenantRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new TenantDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                TenantSetting = new()
                {
                    Id = t.TenantSetting.Id,
                    OnPremise = t.TenantSetting.OnPremise,
                    BaseURL = t.TenantSetting.BaseURL,
                    DbConnectionString = t.TenantSetting.DbConnectionString,
                    BillingContactEmail = t.TenantSetting.BillingContactEmail
                },
                TenantSubscriptions = t.TenantSubscriptions.Select(ts => new TenantSubscriptionDto
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
                }).ToList()
            });

        var tenant = await unitOfWork.TenantRepository.GetSingleAsync(tenantQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant not found.");

        return ApiResponse<TenantDto>.Success(tenant, "Tenant retrieved successfully.");
    }
}
