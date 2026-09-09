using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Queries.ValidateLicense;

public record ValidateLicenseQuery(string Key, string CurrentDomain) : IRequest<ApiResponse<LicenseValidationResponse>>;

public class LicenseValidationResponse
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public bool IsDomainMatched { get; set; }
    public bool IsExpired { get; set; }
    public int RemainingDays { get; set; }
    public LicenseKeyDto? License { get; set; }
}

public class ValidateLicenseQueryHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService)
    : IRequestHandler<ValidateLicenseQuery, ApiResponse<LicenseValidationResponse>>
{
    public async Task<ApiResponse<LicenseValidationResponse>> Handle(ValidateLicenseQuery request, CancellationToken cancellationToken)
    {
        var license = await unitOfWork.LicenseKeyRepository.GetByKeyAsync(request.Key.Trim(), cancellationToken);
        if (license == null)
        {
            return ApiResponse<LicenseValidationResponse>.Success(new LicenseValidationResponse
            {
                IsValid = false,
                Message = "License key not found.",
                IsDomainMatched = false,
                IsExpired = false,
                RemainingDays = 0
            });
        }

        var validation = licenseService.ValidateLicense(license, request.CurrentDomain);

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
            IsExpired = validation.IsExpired,
            RemainingDays = validation.RemainingDays,
            ActivatedAt = license.ActivatedAt
        };

        var response = new LicenseValidationResponse
        {
            IsValid = validation.IsValid,
            Message = validation.ErrorMessage ?? "License is valid and operational.",
            IsDomainMatched = validation.IsDomainMatched,
            IsExpired = validation.IsExpired,
            RemainingDays = validation.RemainingDays,
            License = dto
        };

        return ApiResponse<LicenseValidationResponse>.Success(response);
    }
}
