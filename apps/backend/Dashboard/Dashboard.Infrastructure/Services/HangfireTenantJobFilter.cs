using System.Reflection;
using ERPEZ.Shared.Interfaces;
using Hangfire;
using Hangfire.Common;
using Hangfire.Server;

namespace ERPEZ.Infrastructure.Services;

/// <summary>
/// Hangfire server filter that ensures tenant context propagation in background jobs.
/// Inspects job arguments for Guid tenantId or ITenantScopedJob.
/// - If a tenant ID is present, activates tenant-scoped context prior to job execution.
/// - If no tenant ID is present, activates global system context so global jobs (e.g. PS-DBM sync)
///   can access shared reference data safely without violating fail-closed security invariants.
/// </summary>
public class HangfireTenantJobFilter : JobFilterAttribute, IServerFilter
{
    public void OnPerforming(PerformingContext filterContext)
    {
        var activator = GetActivator(filterContext);
        if (activator == null) return;

        var tenantId = ExtractTenantId(filterContext);
        if (tenantId.HasValue && tenantId.Value != Guid.Empty)
        {
            activator.ActivateTenantAsync(tenantId.Value, filterContext.CancellationToken.ShutdownToken)
                .GetAwaiter()
                .GetResult();
        }
        else
        {
            activator.ActivateGlobalAsync(filterContext.CancellationToken.ShutdownToken)
                .GetAwaiter()
                .GetResult();
        }
    }

    public void OnPerformed(PerformedContext filterContext)
    {
        // No-op upon completion; scope disposal cleans up scoped request context
    }

    private static ITenantBackgroundScopeActivator? GetActivator(PerformingContext filterContext)
    {
        if (filterContext.Items.TryGetValue("JobActivatorScope", out var scopeObj) &&
            scopeObj is JobActivatorScope activatorScope)
        {
            return activatorScope.Resolve(typeof(ITenantBackgroundScopeActivator)) as ITenantBackgroundScopeActivator;
        }

        return null;
    }

    private static Guid? ExtractTenantId(PerformingContext filterContext)
    {
        var job = filterContext.BackgroundJob?.Job;
        if (job == null) return null;

        var parameters = job.Method.GetParameters();
        for (var i = 0; i < parameters.Length && i < job.Args.Count; i++)
        {
            var param = parameters[i];
            var arg = job.Args[i];

            if (arg is Guid guidVal && guidVal != Guid.Empty &&
                (param.Name?.Equals("tenantId", StringComparison.OrdinalIgnoreCase) == true ||
                 param.Name?.Equals("tenant_id", StringComparison.OrdinalIgnoreCase) == true))
            {
                return guidVal;
            }

            if (arg != null)
            {
                var tenantIdProp = arg.GetType().GetProperty("TenantId", BindingFlags.Instance | BindingFlags.Public);
                if (tenantIdProp != null && tenantIdProp.PropertyType == typeof(Guid))
                {
                    var val = (Guid)tenantIdProp.GetValue(arg)!;
                    if (val != Guid.Empty)
                    {
                        return val;
                    }
                }
            }
        }

        return null;
    }
}
