using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.GenerateLicenseKey;

public class GenerateLicenseKeyCommandHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService)
    : IRequestHandler<GenerateLicenseKeyCommand, ApiResponse<LicenseKeyDto>>
{
    public async Task<ApiResponse<LicenseKeyDto>> Handle(GenerateLicenseKeyCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.BoundEmail))
        {
            return ApiResponse<LicenseKeyDto>.Fail("Account bound email is required to issue a license.");
        }

        var keyString = licenseService.GenerateKeyString(request.Prefix, request.BoundEmail, request.ExpiresAt, request.Plan);
        var signature = licenseService.ComputeSignature(keyString, request.BoundEmail, request.AllowedDomain, request.ExpiresAt);

        var license = new LicenseKey
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            TenantSubscriptionId = request.TenantSubscriptionId,
            Key = keyString,
            Prefix = request.Prefix,
            BoundEmail = request.BoundEmail.Trim().ToLowerInvariant(),
            Plan = request.Plan,
            AllowedDomain = request.AllowedDomain.Trim().ToLowerInvariant(),
            MaxTenants = request.MaxTenants <= 0 ? 1 : request.MaxTenants,
            MaxUsers = request.MaxUsers,
            IssuedAt = DateTime.UtcNow,
            ExpiresAt = request.ExpiresAt,
            Status = LicenseStatus.Active,
            IsAirGapped = request.IsAirGapped,
            Signature = signature,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "super-admin"
        };

        await unitOfWork.LicenseKeyRepository.AddAsync(license, cancellationToken);

        // If bound to a tenant, also update tenant's setting allowed domain and max tenants, and sync subscription
        if (request.TenantId.HasValue)
        {
            var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.TenantId.Value, cancellationToken);
            if (tenant != null)
            {
                if (tenant.TenantSetting != null)
                {
                    tenant.TenantSetting.AllowedDomain = request.AllowedDomain;
                    tenant.TenantSetting.MaxAllowedTenants = request.MaxTenants;
                    unitOfWork.TenantSettingRepository.Update(tenant.TenantSetting);
                }

                var existingSubscription = await unitOfWork.TenantSubscriptionRepository.FindAsync(
                    ts => ts.TenantId == tenant.Id && !ts.IsDeleted,
                    cancellationToken: cancellationToken);

                if (existingSubscription != null)
                {
                    existingSubscription.Plan = request.Plan;
                    existingSubscription.Status = Status.Active;
                    existingSubscription.EndDate = request.ExpiresAt;
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
                        Plan = request.Plan,
                        Status = Status.Active,
                        StartDate = DateTime.UtcNow,
                        EndDate = request.ExpiresAt,
                        BillingCycle = BillingCycle.Yearly,
                        Amount = request.Plan switch
                        {
                            Plan.Starter => 99m,
                            Plan.Professional => 299m,
                            Plan.Enterprise => 999m,
                            Plan.OnPremise => 1499m,
                            _ => 0m
                        },
                        AutoRenew = true,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "super-admin"
                    };
                    await unitOfWork.TenantSubscriptionRepository.AddAsync(newSubscription, cancellationToken);
                    license.TenantSubscriptionId = newSubscription.Id;
                }
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

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
            RemainingDays = Math.Max(0, (int)Math.Ceiling((license.ExpiresAt - DateTime.UtcNow).TotalDays)),
            Notes = license.Notes
        };

        return ApiResponse<LicenseKeyDto>.Success(dto, "License key generated successfully.");
    }
}
