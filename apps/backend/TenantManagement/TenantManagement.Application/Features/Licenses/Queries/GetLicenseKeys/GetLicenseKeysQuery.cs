using System.Linq.Expressions;
using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Queries.GetLicenseKeys;

public class GetLicenseKeysQuery : SieveModel, IRequest<PaginatedApiResponse<LicenseKeyDto>>
{
}

public class GetLicenseKeysQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetLicenseKeysQuery, PaginatedApiResponse<LicenseKeyDto>>
{
    public async Task<PaginatedApiResponse<LicenseKeyDto>> Handle(GetLicenseKeysQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.Page,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        Expression<Func<LicenseKey, LicenseKeyDto>> projection = lk => new LicenseKeyDto
        {
            Id = lk.Id,
            TenantId = lk.TenantId,
            TenantName = lk.Tenant != null ? lk.Tenant.Name : null,
            Key = lk.Key,
            Prefix = lk.Prefix,
            BoundEmail = lk.BoundEmail,
            Plan = lk.Plan.ToString(),
            AllowedDomain = lk.AllowedDomain,
            MaxTenants = lk.MaxTenants,
            MaxUsers = lk.MaxUsers,
            IssuedAt = lk.IssuedAt,
            ExpiresAt = lk.ExpiresAt,
            Status = lk.Status.ToString(),
            IsAirGapped = lk.IsAirGapped,
            IsExpired = DateTime.UtcNow > lk.ExpiresAt,
            RemainingDays = Math.Max(0, (int)Math.Ceiling((lk.ExpiresAt - DateTime.UtcNow).TotalDays)),
            ActivatedAt = lk.ActivatedAt,
            Notes = lk.Notes
        };

        var (items, totalCount) = await unitOfWork.LicenseKeyRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<LicenseKeyDto>(
            items.ToList(),
            request.Page ?? 1,
            request.PageSize ?? 10,
            totalCount);
    }
}
