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
    IBackgroundJobClient? backgroundJobClient = null) : IRequestHandler<CreateTenantCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentUserService.UserId)) throw new UnauthorizedAccessException("Current user is not authenticated.");

        var tenantExist = await unitOfWork.TenantRepository.FindAsync(t => t.Name == request.Name, cancellationToken);
        if (tenantExist != null) throw new ConflictException("Tenant already exists.");

        var tenant = new Tenant
        {
            Name = request.Name,
            Description = request.Description,
            ProvisioningState = TenantProvisioningState.Pending,
            TenantSetting = new()
            {
                BillingContactEmail = request.BillingContactEmail,
                OnPremise = request.OnPremise,
                BaseURL = "",
                DbConnectionString = ""
            },
            OperationalDatabase = new TenantOperationalDatabase
            {
                DatabaseServer = "localhost",
                DatabaseName = $"erpez_tenant_{Guid.NewGuid():N}",
                ProvisioningState = TenantProvisioningState.Pending,
                RetryCount = 0
            }
        };

        var module = await unitOfWork.ModuleRepository.FindAsync(m => m.Key == "ams", cancellationToken: cancellationToken);
        if (module != null) tenant.Modules.Add(module);

        var subscription = new TenantSubscription
        {
            TenantId = tenant.Id,
            Plan = Plan.Starter,
            Status = Status.Active,
            Amount = 0m,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(1),
            BillingCycle = BillingCycle.Monthly,
            AutoRenew = true
        };
        tenant.TenantSubscriptions.Add(subscription);

        await unitOfWork.TenantRepository.AddAsync(tenant, cancellationToken);

        var fullName = currentUserService.FullName ?? "";
        var nameParts = fullName.Split(' ', 2);
        var firstName = nameParts[0];
        var lastName = nameParts.Length > 1 ? nameParts[1] : "";

        var tenantMember = new TenantMember
        {
            UserId = currentUserService.UserId,
            ExternalIdentityId = currentUserService.UserId,
            Email = currentUserService.Email ?? "",
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

        tenant.TenantMembers.Add(tenantMember);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Enqueue durable Hangfire provisioning job strictly with tenantId GUID (zero secrets in job arguments)
        backgroundJobClient?.Enqueue<ITenantDatabaseProvisioner>(p => p.ProvisionTenantDatabaseAsync(tenant.Id, CancellationToken.None));

        return ApiResponse<Guid>.Success(tenant.Id, "Tenant created successfully.");
    }
}
