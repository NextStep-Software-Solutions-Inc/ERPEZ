using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Helpers;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Licenses.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.PurchaseLicense;

public class PurchaseLicenseCommand : IRequest<ApiResponse<LicenseKeyDto>>
{
    public Guid TenantId { get; set; }
    public Plan Plan { get; set; } = Plan.Professional;
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Yearly;
    public bool IsAirGapped { get; set; } = true;
    public string AllowedDomain { get; set; } = string.Empty;
    public Guid? PaymentMethodId { get; set; }
}

public class PurchaseLicenseCommandHandler(
    IUnitOfWork unitOfWork,
    ILicenseService licenseService,
    ICurrentUserService currentUserService)
    : IRequestHandler<PurchaseLicenseCommand, ApiResponse<LicenseKeyDto>>
{
    public async Task<ApiResponse<LicenseKeyDto>> Handle(PurchaseLicenseCommand request, CancellationToken cancellationToken)
    {
        if (request.TenantId == Guid.Empty)
        {
            return ApiResponse<LicenseKeyDto>.Fail("A valid TenantId is required to purchase a license.");
        }

        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<LicenseKeyDto>.Fail("Target tenant not found.");
        }

        // Determine price and capacity
        var price = PlanModuleRegistry.GetPlanPrice(request.Plan, request.BillingCycle, request.IsAirGapped);
        var (maxTenants, maxUsers) = PlanModuleRegistry.GetPlanCapacity(request.Plan, request.IsAirGapped);

        // Determine contact email and domain
        var contactEmail = !string.IsNullOrWhiteSpace(tenant.TenantSetting?.BillingContactEmail)
            ? tenant.TenantSetting.BillingContactEmail
            : (!string.IsNullOrWhiteSpace(currentUserService.Email) ? currentUserService.Email : $"{tenant.Name.ToLowerInvariant().Replace(" ", "")}@erpez.local");

        var domain = !string.IsNullOrWhiteSpace(request.AllowedDomain)
            ? request.AllowedDomain.Trim().ToLowerInvariant()
            : (!string.IsNullOrWhiteSpace(tenant.TenantSetting?.AllowedDomain) ? tenant.TenantSetting.AllowedDomain : "localhost");

        // Resolve payment method summary
        TenantPaymentMethod? paymentMethod = null;
        if (request.PaymentMethodId.HasValue)
        {
            paymentMethod = await unitOfWork.TenantPaymentMethodRepository.FindAsync(
                pm => pm.Id == request.PaymentMethodId.Value && pm.TenantId == tenant.Id && !pm.IsDeleted,
                cancellationToken);
        }
        else
        {
            paymentMethod = await unitOfWork.TenantPaymentMethodRepository.FindAsync(
                pm => pm.TenantId == tenant.Id && pm.IsDefault && !pm.IsDeleted,
                cancellationToken);
        }

        var brand = paymentMethod != null && !string.IsNullOrWhiteSpace(paymentMethod.Brand)
            ? paymentMethod.Brand.ToUpper()
            : "CARD";
        var paymentSummary = paymentMethod != null
            ? $"{brand} ending in {paymentMethod.Last4}"
            : "Authorized Payment Method";

        // Generate paid TenantInvoice
        var taxRate = 0.12m;
        var taxAmount = Math.Round(price * taxRate, 2);
        var totalAmount = price + taxAmount;

        var invoice = new TenantInvoice
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            PlanName = $"{request.Plan} {(request.IsAirGapped ? "On-Premise" : "Cloud SaaS")}",
            BillingCycle = request.BillingCycle,
            InvoiceDate = DateTime.UtcNow,
            DueDate = DateTime.UtcNow,
            PaidDate = DateTime.UtcNow,
            SubtotalAmount = price,
            TaxRate = taxRate,
            TaxAmount = taxAmount,
            TotalAmount = totalAmount,
            Currency = "USD",
            Status = InvoiceStatus.Paid,
            PaymentMethodSummary = paymentSummary,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserService.UserId ?? "system"
        };

        invoice.Items.Add(new TenantInvoiceItem
        {
            Id = Guid.NewGuid(),
            TenantInvoiceId = invoice.Id,
            Description = $"{request.Plan} Plan ({(request.IsAirGapped ? "Air-Gapped Sovereign" : "Cloud SaaS")}) - 1 Year Subscription",
            Quantity = 1,
            UnitPrice = price,
            TotalPrice = price,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserService.UserId ?? "system"
        });

        await unitOfWork.TenantInvoiceRepository.AddAsync(invoice, cancellationToken);

        // Synchronize or create TenantSubscription
        var durationDays = request.BillingCycle == BillingCycle.Yearly ? 365 : 30;
        var subExpiry = DateTime.UtcNow.AddDays(durationDays);

        var existingSub = await unitOfWork.TenantSubscriptionRepository.FindAsync(
            s => s.TenantId == tenant.Id && !s.IsDeleted,
            cancellationToken);

        if (existingSub != null)
        {
            existingSub.Plan = request.Plan;
            existingSub.BillingCycle = request.BillingCycle;
            existingSub.Amount = price;
            existingSub.StartDate = DateTime.UtcNow;
            existingSub.EndDate = subExpiry;
            existingSub.Status = Status.Active;
            existingSub.AutoRenew = true;
            existingSub.UpdatedAt = DateTime.UtcNow;
            unitOfWork.TenantSubscriptionRepository.Update(existingSub);
            invoice.TenantSubscriptionId = existingSub.Id;
        }
        else
        {
            var newSub = new TenantSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Plan = request.Plan,
                BillingCycle = request.BillingCycle,
                Amount = price,
                StartDate = DateTime.UtcNow,
                EndDate = subExpiry,
                Status = Status.Active,
                AutoRenew = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserService.UserId ?? "system"
            };
            await unitOfWork.TenantSubscriptionRepository.AddAsync(newSub, cancellationToken);
            invoice.TenantSubscriptionId = newSub.Id;
        }

        // Synchronize authorized modules
        var requiredModuleKeys = PlanModuleRegistry.GetModuleKeysForPlan(request.Plan);
        var allModules = await unitOfWork.ModuleRepository.ToListAsync(
            unitOfWork.ModuleRepository.Query(m => m.IsActive),
            cancellationToken);

        if (allModules != null && allModules.Count > 0)
        {
            var tenantWithModules = await unitOfWork.TenantRepository
                .Query(t => t.Id == tenant.Id)
                .Include(t => t.Modules)
                .FirstOrDefaultAsync(cancellationToken);

            if (tenantWithModules != null)
            {
                tenantWithModules.Modules.Clear();
                foreach (var mod in allModules.Where(m => requiredModuleKeys.Contains(m.Key.ToLowerInvariant())))
                {
                    tenantWithModules.Modules.Add(mod);
                }
            }
        }

        // Mint and HMAC-sign cryptographic LicenseKey
        var prefix = request.IsAirGapped ? "EPZ-ONPREM" : "EPZ-CLOUD";
        var keyString = licenseService.GenerateKeyString(prefix, contactEmail, subExpiry, request.Plan);
        var signature = licenseService.ComputeSignature(keyString, contactEmail, domain, subExpiry);

        var license = new LicenseKey
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            TenantSubscriptionId = invoice.TenantSubscriptionId,
            Key = keyString,
            Prefix = prefix,
            BoundEmail = contactEmail,
            Plan = request.Plan,
            AllowedDomain = domain,
            MaxTenants = maxTenants,
            MaxUsers = maxUsers,
            IssuedAt = DateTime.UtcNow,
            ExpiresAt = subExpiry,
            ActivatedAt = DateTime.UtcNow,
            Status = LicenseStatus.Active,
            IsAirGapped = request.IsAirGapped,
            Signature = signature,
            Notes = $"{request.Plan} {(request.IsAirGapped ? "On-Premise Sovereign" : "Cloud SaaS")} License Key",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserService.UserId ?? "system"
        };

        await unitOfWork.LicenseKeyRepository.AddAsync(license, cancellationToken);

        // Update TenantSetting
        if (tenant.TenantSetting != null)
        {
            tenant.TenantSetting.AllowedDomain = domain;
            tenant.TenantSetting.MaxAllowedTenants = maxTenants;
            tenant.TenantSetting.OnPremise = request.IsAirGapped;
            unitOfWork.TenantSettingRepository.Update(tenant.TenantSetting);
        }

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
            IsExpired = false,
            RemainingDays = durationDays,
            ActivatedAt = license.ActivatedAt,
            Notes = license.Notes
        };

        return ApiResponse<LicenseKeyDto>.Success(dto, "License purchased and provisioned successfully.");
    }
}
