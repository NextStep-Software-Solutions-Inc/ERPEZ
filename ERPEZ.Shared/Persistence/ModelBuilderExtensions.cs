using System.Linq.Expressions;
using ERPEZ.Shared.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Shared.Persistence;

/// <summary>
/// Extension methods for ModelBuilder to configure common entity conventions.
/// </summary>
public static class ModelBuilderExtensions
{
    /// <summary>
    /// Configures all entities with: primary keys (Guid with gen_random_uuid), 
    /// schema based on namespace, enum conversions, and soft delete query filters.
    /// </summary>
    public static ModelBuilder ConfigureDefaultEntityConventions(this ModelBuilder modelBuilder)
    {
        // Set default schema for this context
        modelBuilder.HasDefaultSchema("public");
        
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var idProperty = entity.FindProperty("Id");

            // Configure primary keys for entities without explicit keys
            if (idProperty != null && entity.FindPrimaryKey() == null)
            {
                if (idProperty.ClrType == typeof(Guid))
                {
                    idProperty.SetDefaultValueSql("gen_random_uuid()");
                }
                entity.SetPrimaryKey(idProperty);
                idProperty.ValueGenerated = Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.OnAdd;
            }

            // Configure schema for entities based on their subdirectory (automatic detection)
            if (entity.ClrType.Namespace != null)
            {
                var namespaceParts = entity.ClrType.Namespace.Split('.');
                var entitiesIndex = Array.IndexOf(namespaceParts, "Entities");

                if (entitiesIndex >= 0 && entitiesIndex < namespaceParts.Length - 1)
                {
                    var schemaName = namespaceParts[entitiesIndex + 1].ToLowerInvariant();
                    entity.SetSchema(schemaName);
                }
            }

            // Configure enum properties to use string conversion
            foreach (var property in entity.GetProperties().Where(p => p.ClrType.IsEnum))
            {
                modelBuilder.Entity(entity.ClrType)
                    .Property(property.Name)
                    .HasConversion<string>();
            }

            // Apply soft delete query filter for ISoftDeleteEntity implementations
            if (typeof(ISoftDeleteEntity).IsAssignableFrom(entity.ClrType))
            {
                var parameter = Expression.Parameter(entity.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDeleteEntity.IsDeleted));
                var notDeleted = Expression.Not(property);
                var lambda = Expression.Lambda(notDeleted, parameter);
                entity.SetQueryFilter(lambda);
            }
            
        }

        return modelBuilder;
    }
}
