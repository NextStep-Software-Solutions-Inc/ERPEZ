using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ERPEZ.Shared.Interceptors;

/// <summary>
/// Interceptor that automatically sets audit fields (CreatedAt, UpdatedAt, DeletedAt) and user tracking.
/// Also implements soft delete functionality by marking entities as IsDeleted instead of hard deleting.
/// </summary>
public class AuditingInterceptor(ICurrentUserService currentUser) : SaveChangesInterceptor
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

        foreach (var entry in context.ChangeTracker.Entries())
        {
            var entity = entry.Entity;
            if (entity == null) continue;

            var entityType = entity.GetType();

            if (entry.State == EntityState.Added)
            {
                var createdAtProp = entityType.GetProperty("CreatedAt");
                if (createdAtProp != null && createdAtProp.CanWrite)
                {
                    var val = (DateTime)createdAtProp.GetValue(entity)!;
                    if (val == default)
                    {
                        createdAtProp.SetValue(entity, now);
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
        }
    }
}
