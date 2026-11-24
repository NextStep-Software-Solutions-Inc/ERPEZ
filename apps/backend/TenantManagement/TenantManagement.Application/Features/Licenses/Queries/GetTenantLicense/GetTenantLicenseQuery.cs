using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Queries.GetTenantLicense;

public record GetTenantLicenseQuery(Guid TenantId, string? CurrentDomain = null) : IRequest<ApiResponse<LicenseKeyDto?>>;

public class GetTenantLicenseQueryHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService)
    : IRequestHandler<GetTenantLicenseQuery, ApiResponse<LicenseKeyDto?>>
{
    public async Task<ApiResponse<LicenseKeyDto?>> Handle(GetTenantLicenseQuery request, CancellationToken cancellationToken)
    {
        var license = await unitOfWork.LicenseKeyRepository.GetActiveByTenantIdAsync(request.TenantId, cancellationToken);
        if (license == null)
        {
            return ApiResponse<LicenseKeyDto?>.Success(null, "No active license found for this tenant.");
        }

        var validation = licenseService.ValidateLicense(license, request.CurrentDomain ?? string.Empty);

        var dto = new LicenseKeyDto
        {
            Id = license.Id,
            TenantId = license.TenantId,
            Key = license.Key,
            Prefix = license.Prefix,
            BoundEmail = license.BoundEmail,
            Plan = license.Plan.ToString(),
            AllowedDomain = license.AllowedDomain,
            MaxTenants = license.MaxTenants,
            MaxUsers = license.MaxUsers,
            IssuedAt = license.IssuedAt,
            ExpiresAt = license.ExpiresAt,
            Status = license.Status.ToString(),
            IsAirGapped = license.IsAirGapped,
            IsExpired = DateTime.UtcNow > license.ExpiresAt,
            RemainingDays = validation.RemainingDays,
            ActivatedAt = license.ActivatedAt,
            Notes = license.Notes
        };

        return ApiResponse<LicenseKeyDto?>.Success(dto);
    }
}
