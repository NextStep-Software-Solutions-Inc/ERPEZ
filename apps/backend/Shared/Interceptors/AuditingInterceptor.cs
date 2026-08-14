using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ERPEZ.Shared.Interceptors;

/// <summary>
/// Interceptor that automatically sets audit fields (CreatedAt, UpdatedAt, DeletedAt) and user tracking.
/// Also implements soft delete functionality by marking entities as IsDeleted instead of hard deleting.
/// Ensures all DateTime values have Kind=Utc to prevent PostgreSQL timestamp with time zone errors.
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
                        // Always set to UtcNow with explicit UTC Kind
                        createdAtProp.SetValue(entity, now);
                    }
                    else
                    {
                        // Ensure existing value has UTC Kind
                        createdAtProp.SetValue(entity, EnsureUtcKind(val));
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
                    // Always set to UtcNow with explicit UTC Kind
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
                        // Always set to UtcNow with explicit UTC Kind
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

    /// <summary>
    /// Ensures a DateTime value has Kind=UTC. Converts Unspecified or Local kinds to UTC.
    /// PostgreSQL's timestamp with time zone requires all DateTimes to have Kind=Utc.
    /// </summary>
    private static DateTime EnsureUtcKind(DateTime dateTime)
    {
        return dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Unspecified => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc),
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => dateTime
        };
    }
}
