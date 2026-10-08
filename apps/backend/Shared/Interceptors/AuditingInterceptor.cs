using System.Security;
using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ERPEZ.Shared.Interceptors;

/// <summary>
/// Interceptor that automatically sets audit fields (CreatedAt, UpdatedAt, DeletedAt) and user tracking.
/// Also enforces strict multi-tenant write protection: stamping TenantId on insert, immutability on update,
/// and ownership validation on modification and deletion.
/// Implements soft delete functionality by marking entities as IsDeleted instead of hard deleting.
/// </summary>
public class AuditingInterceptor(
    ICurrentUserService currentUser,
    ITenantRequestContext? tenantRequestContext = null) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        ApplyAuditing(eventData.Context);
        return result;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        ApplyAuditing(eventData.Context);
        return ValueTask.FromResult(result);
    }

    private void ApplyAuditing(DbContext? context)
    {
        if (context is null) return;

        var userId = string.IsNullOrWhiteSpace(currentUser.UserId) ? "system" : currentUser.UserId;
        var now = DateTime.UtcNow;

        Guid? activeTenantId = null;
        if (tenantRequestContext?.IsResolved == true && tenantRequestContext.TenantId.HasValue)
        {
            activeTenantId = tenantRequestContext.TenantId.Value;
        }
        else
        {
            var currentTenantProp = context.GetType().GetProperty("CurrentTenantId");
            if (currentTenantProp != null)
            {
                activeTenantId = (Guid?)currentTenantProp.GetValue(context);
            }
        }

        foreach (var entry in context.ChangeTracker.Entries())
        {
            var entity = entry.Entity;
            if (entity == null) continue;

            var entityType = entity.GetType();

            var isTenantScoped = entityType.GetInterfaces().Any(i => i.Name == "ITenantScopedEntity");

            if (entry.State == EntityState.Added)
            {
                if (isTenantScoped)
                {
                    var tenantProp = entry.Property("TenantId");
                    if (activeTenantId.HasValue && activeTenantId.Value != Guid.Empty)
                    {
                        tenantProp.CurrentValue = activeTenantId.Value;
                    }
                    else
                    {
                        var currentVal = (Guid?)tenantProp.CurrentValue;
                        if (!currentVal.HasValue || currentVal.Value == Guid.Empty)
                        {
                            throw new SecurityException(
                                $"Cannot insert tenant-scoped entity '{entityType.Name}' without an established tenant context.");
                        }
                    }
                }

                var createdAtProp = entityType.GetProperty("CreatedAt");
                if (createdAtProp != null && createdAtProp.CanWrite)
                {
                    var val = (DateTime)createdAtProp.GetValue(entity)!;
                    if (val == default)
                    {
                        createdAtProp.SetValue(entity, now);
                    }
                    else if (val.Kind == DateTimeKind.Unspecified)
                    {
                        createdAtProp.SetValue(entity, DateTime.SpecifyKind(val, DateTimeKind.Utc));
                    }
                    else
                    {
                        createdAtProp.SetValue(entity, val.ToUniversalTime());
                    }
                }

                var createdByProp = entityType.GetProperty("CreatedBy");
                if (createdByProp != null && createdByProp.CanWrite)
                {
                    var val = (string?)createdByProp.GetValue(entity);
                    if (string.IsNullOrWhiteSpace(val))
                    {
                        createdByProp.SetValue(entity, userId);
                    }
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                if (isTenantScoped)
                {
                    var tenantProp = entry.Property("TenantId");
                    if (tenantProp.IsModified && !Equals(tenantProp.OriginalValue, tenantProp.CurrentValue))
                    {
                        throw new SecurityException(
                            $"TenantId on entity '{entityType.Name}' is immutable and cannot be modified.");
                    }

                    if (activeTenantId.HasValue && activeTenantId.Value != Guid.Empty)
                    {
                        var currentVal = (Guid?)tenantProp.CurrentValue;
                        if (currentVal.HasValue && currentVal.Value != activeTenantId.Value)
                        {
                            throw new SecurityException(
                                $"Unauthorized cross-tenant modification attempt on entity '{entityType.Name}'.");
                        }
                    }
                }

                var updatedAtProp = entityType.GetProperty("UpdatedAt");
                if (updatedAtProp != null && updatedAtProp.CanWrite)
                {
                    updatedAtProp.SetValue(entity, now);
                }

                var updatedByProp = entityType.GetProperty("UpdatedBy");
                if (updatedByProp != null && updatedByProp.CanWrite)
                {
                    updatedByProp.SetValue(entity, userId);
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                if (isTenantScoped)
                {
                    if (activeTenantId.HasValue && activeTenantId.Value != Guid.Empty)
                    {
                        var tenantProp = entry.Property("TenantId");
                        var currentVal = (Guid?)tenantProp.CurrentValue;
                        if (currentVal.HasValue && currentVal.Value != activeTenantId.Value)
                        {
                            throw new SecurityException(
                                $"Unauthorized cross-tenant deletion attempt on entity '{entityType.Name}'.");
                        }
                    }
                }

                var isDeletedProp = entityType.GetProperty("IsDeleted");
                var allowHardDeleteProp = entityType.GetProperty("AllowHardDelete");

                var allowHardDelete = allowHardDeleteProp != null && (bool)(allowHardDeleteProp.GetValue(entity) ?? false);

                if (isDeletedProp != null && isDeletedProp.CanWrite && !allowHardDelete)
                {
                    entry.State = EntityState.Modified;
                    isDeletedProp.SetValue(entity, true);

                    var deletedAtProp = entityType.GetProperty("DeletedAt");
                    if (deletedAtProp != null && deletedAtProp.CanWrite)
                    {
                        deletedAtProp.SetValue(entity, now);
                    }

                    var deletedByProp = entityType.GetProperty("DeletedBy");
                    if (deletedByProp != null && deletedByProp.CanWrite)
                    {
                        deletedByProp.SetValue(entity, userId);
                    }
                }
            }

            // Convert any Unspecified DateTime property across the entity to UTC
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                foreach (var prop in entry.Properties)
                {
                    if (prop.CurrentValue is DateTime dt && dt.Kind == DateTimeKind.Unspecified)
                    {
                        prop.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                    }
                }
            }
        }
    }
}
