using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Common.Helpers;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenantModules;

public sealed class UpdateTenantModulesCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateTenantModulesCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateTenantModulesCommand request, CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository
            .Query(t => t.Id == request.TenantId)
            .Include(t => t.Modules)
            .FirstOrDefaultAsync(cancellationToken) 
            ?? throw new NotFoundException($"Tenant with id {request.TenantId} was not found.");

        // Resolve active subscription plan for this tenant
        var activeSub = await unitOfWork.TenantSubscriptionRepository
            .FindAsync(s => s.TenantId == tenant.Id && s.Status == Status.Active && s.EndDate >= DateTime.UtcNow, cancellationToken)
            ?? await unitOfWork.TenantSubscriptionRepository
                .FindAsync(s => s.TenantId == tenant.Id && !s.IsDeleted, cancellationToken);

        var currentPlan = activeSub != null && activeSub.Status == Status.Active && activeSub.EndDate >= DateTime.UtcNow
            ? activeSub.Plan
            : Plan.Starter;

        var allowedModuleKeys = PlanModuleRegistry.GetModuleKeysForPlan(currentPlan)
            .Select(k => k.ToLowerInvariant())
            .ToHashSet();

        var targetKeys = request.ModuleKeys
            .Select(k => k.ToLowerInvariant())
            .ToHashSet();
        targetKeys.Add("ams");

        var unauthorizedKeys = targetKeys.Where(k => !allowedModuleKeys.Contains(k)).ToList();
        if (unauthorizedKeys.Count > 0)
        {
            return ApiResponse<Guid>.Fail(
                $"Cannot activate module(s) '{string.Join(", ", unauthorizedKeys)}' not included in your organization's active {currentPlan} plan.");
        }

        var allModules = await unitOfWork.ModuleRepository
            .Query()
            .ToListAsync(cancellationToken);

        var targetModules = allModules
            .Where(m => targetKeys.Contains(m.Key.ToLowerInvariant()))
            .ToList();

        tenant.Modules.Clear();
        foreach (var mod in targetModules)
        {
            tenant.Modules.Add(mod);
        }

        unitOfWork.TenantRepository.Update(tenant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(tenant.Id, "Tenant modules updated successfully.");
    }
}
