using ERPEZ.Shared.Common;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Common.Interfaces;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Hangfire;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.CreateTenant;

public sealed class CreateTenantCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    IBackgroundJobClient? backgroundJobClient = null,
    ILicenseService? licenseService = null) : IRequestHandler<CreateTenantCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentUserService.UserId)) throw new UnauthorizedAccessException("Current user is not authenticated.");

        var tenantExist = await unitOfWork.TenantRepository.FindAsync(t => t.Name == request.Name, cancellationToken);
        if (tenantExist != null) throw new ConflictException("Tenant already exists.");

        var isClerk = currentUserService.UserId?.StartsWith("user_") == true;
        var provider = isClerk ? IdentityProvider.Clerk : IdentityProvider.Keycloak;

        var tenant = new Tenant
        {
            Name = request.Name,
            Description = request.Description,
            AuthProvider = provider,
            ProvisioningState = TenantProvisioningState.Ready,
            TenantSetting = new()
            {
                BillingContactEmail = request.BillingContactEmail,
                OnPremise = request.OnPremise,
                AllowedDomain = "localhost",
                BaseURL = "",
                DbConnectionString = ""
            },
            OperationalDatabase = new TenantOperationalDatabase
            {
                DatabaseServer = "localhost",
                DatabaseName = $"erpez_tenant_{Guid.NewGuid():N}",
                ProvisioningState = TenantProvisioningState.Ready,
                RetryCount = 0
            }
        };

        // Provision full system access: all active system modules (PBMS, PMS, SAMS, AMS)
        var allModules = await unitOfWork.ModuleRepository.ToListAsync(
            unitOfWork.ModuleRepository.Query(m => m.IsActive), cancellationToken);
        if (allModules != null && allModules.Count > 0)
        {
            foreach (var m in allModules)
            {
                tenant.Modules.Add(m);
            }
        }
        else
        {
            var defaultModule = await unitOfWork.ModuleRepository.FindAsync(m => m.Key == "ams", cancellationToken: cancellationToken);
            if (defaultModule != null) tenant.Modules.Add(defaultModule);
        }

        // 14-day Free Trial Subscription
        var trialDays = 14;
        var trialExpiry = DateTime.UtcNow.AddDays(trialDays);
        var subscription = new TenantSubscription
        {
            TenantId = tenant.Id,
            Plan = Plan.Starter,
            Status = Status.Active,
            Amount = 0m,
            StartDate = DateTime.UtcNow,
            EndDate = trialExpiry,
            BillingCycle = BillingCycle.Monthly,
            AutoRenew = false
        };
        tenant.TenantSubscriptions.Add(subscription);

        // Generate matching 14-day Trial License Key
        if (licenseService != null)
        {
            var keyString = licenseService.GenerateKeyString("TRIAL", request.BillingContactEmail, trialExpiry, Plan.Starter);
            var signature = licenseService.ComputeSignature(keyString, request.BillingContactEmail, "localhost", trialExpiry);
            var license = new LicenseKey
            {
                TenantId = tenant.Id,
                Key = keyString,
                Prefix = "TRIAL",
                BoundEmail = request.BillingContactEmail,
                Plan = Plan.Starter,
                AllowedDomain = "localhost",
                MaxTenants = 1,
                MaxUsers = 10,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = trialExpiry,
                Status = LicenseStatus.Active,
                Signature = signature,
                Notes = $"{trialDays}-Day Full System Access Free Trial"
            };
            tenant.LicenseKeys.Add(license);
        }

        await unitOfWork.TenantRepository.AddAsync(tenant, cancellationToken);

        var fullName = currentUserService.FullName ?? "";
        var nameParts = fullName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var firstName = nameParts.Length > 0 ? nameParts[0] : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name : "Admin");
        var lastName = nameParts.Length > 1 ? nameParts[1] : "";

        var memberEmail = !string.IsNullOrWhiteSpace(currentUserService.Email) 
            ? currentUserService.Email 
            : request.BillingContactEmail;

        var tenantMember = new TenantMember
        {
            UserId = currentUserService.UserId,
            ExternalIdentityId = currentUserService.ExternalIdentityId ?? currentUserService.UserId,
            Provider = provider,
            Email = memberEmail,
            FirstName = firstName,
            LastName = lastName,
            Status = Status.Active
        };

        var adminRole = await unitOfWork.RoleRepository.FindAsync(r => r.NormalizedName == "TENANT ADMINISTRATOR", cancellationToken);
        if (adminRole != null)
        {
            tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                RoleId = adminRole.Id
            });
        }

        var workspaceAdminRole = await unitOfWork.RoleRepository.FindAsync(r => r.NormalizedName == "DASHBOARD SYSTEM ADMIN", cancellationToken);
        if (workspaceAdminRole != null)
        {
            tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
            {
                RoleId = workspaceAdminRole.Id
            });
        }

        tenant.TenantMembers.Add(tenantMember);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Enqueue durable Hangfire provisioning job strictly with tenantId GUID (zero secrets in job arguments)
        backgroundJobClient?.Enqueue<ITenantDatabaseProvisioner>(p => p.ProvisionTenantDatabaseAsync(tenant.Id, CancellationToken.None));

        return ApiResponse<Guid>.Success(tenant.Id, "Tenant created successfully.");
    }
}
