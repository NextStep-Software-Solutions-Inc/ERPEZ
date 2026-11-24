using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ActivateLicense;

public class ActivateLicenseCommand : IRequest<ApiResponse<LicenseKeyDto>>
{
    public string Key { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string CurrentDomain { get; set; } = string.Empty;
}

public class ActivateLicenseCommandHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService)
    : IRequestHandler<ActivateLicenseCommand, ApiResponse<LicenseKeyDto>>
{
    public async Task<ApiResponse<LicenseKeyDto>> Handle(ActivateLicenseCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Key))
        {
            return ApiResponse<LicenseKeyDto>.Fail("Please provide a valid license key.");
        }

        var license = await unitOfWork.LicenseKeyRepository.GetByKeyAsync(request.Key.Trim(), cancellationToken);
        if (license == null)
        {
            return ApiResponse<LicenseKeyDto>.Fail("Invalid license key. License not found.");
        }

        var validation = licenseService.ValidateLicense(license, request.CurrentDomain);
        if (!validation.IsValid)
        {
            return ApiResponse<LicenseKeyDto>.Fail($"License activation failed: {validation.ErrorMessage}");
        }

        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<LicenseKeyDto>.Fail("Target tenant not found.");
        }

        // Link license to this tenant
        license.TenantId = tenant.Id;
        license.ActivatedAt = DateTime.UtcNow;
        license.Status = LicenseStatus.Active;

        if (tenant.TenantSetting != null)
        {
            tenant.TenantSetting.AllowedDomain = license.AllowedDomain;
            tenant.TenantSetting.MaxAllowedTenants = license.MaxTenants;
            unitOfWork.TenantSettingRepository.Update(tenant.TenantSetting);
        }

        // Also synchronize or create TenantSubscription
        var existingSubscription = await unitOfWork.TenantSubscriptionRepository.FindAsync(
            ts => ts.TenantId == tenant.Id && !ts.IsDeleted,
            cancellationToken: cancellationToken);

        if (existingSubscription != null)
        {
            existingSubscription.Plan = license.Plan;
            existingSubscription.Status = Status.Active;
            existingSubscription.EndDate = license.ExpiresAt;
            existingSubscription.AutoRenew = true;
            unitOfWork.TenantSubscriptionRepository.Update(existingSubscription);
            license.TenantSubscriptionId = existingSubscription.Id;
        }
        else
        {
            var newSubscription = new TenantSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Plan = license.Plan,
                Status = Status.Active,
                StartDate = DateTime.UtcNow,
                EndDate = license.ExpiresAt,
                BillingCycle = BillingCycle.Yearly,
                Amount = license.Plan switch
                {
                    Plan.Starter => 99m,
                    Plan.Professional => 299m,
                    Plan.Enterprise => 999m,
                    Plan.OnPremise => 1499m,
                    _ => 0m
                },
                AutoRenew = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            await unitOfWork.TenantSubscriptionRepository.AddAsync(newSubscription, cancellationToken);
            license.TenantSubscriptionId = newSubscription.Id;
        }

        unitOfWork.LicenseKeyRepository.Update(license);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LicenseKeyDto
        {
            Id = license.Id,
            TenantId = license.TenantId,
            TenantName = tenant.Name,
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

        return ApiResponse<LicenseKeyDto>.Success(dto, "License activated successfully.");
    }
}
