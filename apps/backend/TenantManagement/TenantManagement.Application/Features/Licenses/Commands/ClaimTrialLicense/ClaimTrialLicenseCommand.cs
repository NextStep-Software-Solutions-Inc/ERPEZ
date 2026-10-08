using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.ClaimTrialLicense;

public class ClaimTrialLicenseCommand : IRequest<ApiResponse<LicenseKeyDto>>
{
    public Guid TenantId { get; set; }
    public string? AllowedDomain { get; set; }
}

public class ClaimTrialLicenseCommandHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService,
    ICurrentUserService currentUserService)
    : IRequestHandler<ClaimTrialLicenseCommand, ApiResponse<LicenseKeyDto>>
{
    private const int trialDurationDays = 30;

    public async Task<ApiResponse<LicenseKeyDto>> Handle(ClaimTrialLicenseCommand request, CancellationToken cancellationToken)
    {
        if (request.TenantId == Guid.Empty)
        {
            return ApiResponse<LicenseKeyDto>.Fail("A valid TenantId is required to claim a trial license.");
        }

        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<LicenseKeyDto>.Fail("Target tenant not found.");
        }

        // Determine contact email and allowed domain
        var contactEmail = !string.IsNullOrWhiteSpace(tenant.TenantSetting?.BillingContactEmail)
            ? tenant.TenantSetting.BillingContactEmail
            : (!string.IsNullOrWhiteSpace(currentUserService.Email) ? currentUserService.Email : $"{tenant.Name.ToLowerInvariant().Replace(" ", "")}@erpez.local");

        var domain = !string.IsNullOrWhiteSpace(request.AllowedDomain)
            ? request.AllowedDomain.Trim().ToLowerInvariant()
            : (!string.IsNullOrWhiteSpace(tenant.TenantSetting?.AllowedDomain) ? tenant.TenantSetting.AllowedDomain : "localhost");

        // Check if an active non-expired trial license key already exists for this tenant
        var existingActiveLicense = await unitOfWork.LicenseKeyRepository.GetActiveByTenantIdAsync(tenant.Id, cancellationToken);

        if (existingActiveLicense != null && existingActiveLicense.ExpiresAt > DateTime.UtcNow)
        {
            var remainingDays = Math.Max(0, (int)Math.Ceiling((existingActiveLicense.ExpiresAt - DateTime.UtcNow).TotalDays));
            var existingDto = new LicenseKeyDto
            {
                Id = existingActiveLicense.Id,
                TenantId = existingActiveLicense.TenantId,
                TenantName = tenant.Name,
                Key = existingActiveLicense.Key,
                Prefix = existingActiveLicense.Prefix,
                BoundEmail = existingActiveLicense.BoundEmail,
                Plan = existingActiveLicense.Plan.ToString(),
                AllowedDomain = existingActiveLicense.AllowedDomain,
                MaxTenants = existingActiveLicense.MaxTenants,
                MaxUsers = existingActiveLicense.MaxUsers,
                IssuedAt = existingActiveLicense.IssuedAt,
                ExpiresAt = existingActiveLicense.ExpiresAt,
                Status = existingActiveLicense.Status.ToString(),
                IsAirGapped = existingActiveLicense.IsAirGapped,
                IsExpired = false,
                RemainingDays = remainingDays,
                ActivatedAt = existingActiveLicense.ActivatedAt,
                Notes = existingActiveLicense.Notes
            };

            return ApiResponse<LicenseKeyDto>.Success(existingDto, "Active 30-day trial license already provisioned for this tenant.");
        }

        // Provision a new 30-day Free Trial License Key (Professional Tier: AMS + PBMS + PMS)
        var trialExpiry = DateTime.UtcNow.AddDays(trialDurationDays);
        var keyString = licenseService.GenerateKeyString("TRIAL", contactEmail, trialExpiry, Plan.Professional);
        var signature = licenseService.ComputeSignature(keyString, contactEmail, domain, trialExpiry);

        var newLicense = new LicenseKey
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            Key = keyString,
            Prefix = "TRIAL",
            BoundEmail = contactEmail,
            Plan = Plan.Professional,
            AllowedDomain = domain,
            MaxTenants = 1,
            MaxUsers = 10,
            IssuedAt = DateTime.UtcNow,
            ExpiresAt = trialExpiry,
            ActivatedAt = DateTime.UtcNow,
            Status = LicenseStatus.Active,
            Signature = signature,
            Notes = $"{trialDurationDays}-Day Full System Access Free Trial",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserService.UserId ?? "system"
        };

        await unitOfWork.LicenseKeyRepository.AddAsync(newLicense, cancellationToken);

        // Update tenant settings if allowed domain is empty
        if (tenant.TenantSetting != null)
        {
            if (string.IsNullOrWhiteSpace(tenant.TenantSetting.AllowedDomain) || tenant.TenantSetting.AllowedDomain == "localhost")
            {
                tenant.TenantSetting.AllowedDomain = domain;
            }
            tenant.TenantSetting.MaxAllowedTenants = 1;
            unitOfWork.TenantSettingRepository.Update(tenant.TenantSetting);
        }

        // Synchronize or create matching 30-day TenantSubscription
        var existingSubscription = await unitOfWork.TenantSubscriptionRepository.FindAsync(
            ts => ts.TenantId == tenant.Id && !ts.IsDeleted,
            cancellationToken: cancellationToken);

        if (existingSubscription != null)
        {
            existingSubscription.Plan = Plan.Professional;
            existingSubscription.Status = Status.Active;
            existingSubscription.StartDate = DateTime.UtcNow;
            existingSubscription.EndDate = trialExpiry;
            existingSubscription.Amount = 0m;
            existingSubscription.AutoRenew = false;
            unitOfWork.TenantSubscriptionRepository.Update(existingSubscription);
            newLicense.TenantSubscriptionId = existingSubscription.Id;
        }
        else
        {
            var newSubscription = new TenantSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Plan = Plan.Professional,
                Status = Status.Active,
                StartDate = DateTime.UtcNow,
                EndDate = trialExpiry,
                BillingCycle = BillingCycle.Monthly,
                Amount = 0m,
                AutoRenew = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserService.UserId ?? "system"
            };
            await unitOfWork.TenantSubscriptionRepository.AddAsync(newSubscription, cancellationToken);
            newLicense.TenantSubscriptionId = newSubscription.Id;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LicenseKeyDto
        {
            Id = newLicense.Id,
            TenantId = newLicense.TenantId,
            TenantName = tenant.Name,
            Key = newLicense.Key,
            Prefix = newLicense.Prefix,
            BoundEmail = newLicense.BoundEmail,
            Plan = newLicense.Plan.ToString(),
            AllowedDomain = newLicense.AllowedDomain,
            MaxTenants = newLicense.MaxTenants,
            MaxUsers = newLicense.MaxUsers,
            IssuedAt = newLicense.IssuedAt,
            ExpiresAt = newLicense.ExpiresAt,
            Status = newLicense.Status.ToString(),
            IsAirGapped = newLicense.IsAirGapped,
            IsExpired = false,
            RemainingDays = trialDurationDays,
            ActivatedAt = newLicense.ActivatedAt,
            Notes = newLicense.Notes
        };

        return ApiResponse<LicenseKeyDto>.Success(dto, "30-day free trial license provisioned and activated successfully.");
    }
}
