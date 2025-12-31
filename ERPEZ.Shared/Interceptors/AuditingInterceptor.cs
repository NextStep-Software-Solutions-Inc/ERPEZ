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

        var userId = currentUser.UserId ?? "system";
        var now = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Check if the entity has audit properties
            var auditableEntity = entry.Entity as IAuditableEntity;
            if (auditableEntity == null) continue;

            switch (entry.State)
            {
                case EntityState.Added:
                    auditableEntity.CreatedAt = now;
                    auditableEntity.CreatedBy = userId;
                    break;
                case EntityState.Modified:
                    auditableEntity.UpdatedAt = now;
                    auditableEntity.UpdatedBy = userId;
                    break;
                case EntityState.Deleted:
                    if (auditableEntity is ISoftDeleteEntity softDeleteEntity)
                    {
                        if (softDeleteEntity.AllowHardDelete)
                        {
                            break;
                        }
                        entry.State = EntityState.Modified;
                        softDeleteEntity.IsDeleted = true;
                        softDeleteEntity.DeletedAt = now;
                        softDeleteEntity.DeletedBy = userId;
                    }
                    break;
            }
        }
    }
}
