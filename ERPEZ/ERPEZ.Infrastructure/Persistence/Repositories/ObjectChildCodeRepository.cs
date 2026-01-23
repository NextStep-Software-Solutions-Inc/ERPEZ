using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for managing Object child code operations.
/// </summary>
public class ObjectChildCodeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<ObjectChildCode>(context, sieveProcessor), IObjectChildCodeRepository
{
    public async Task<List<ObjectChildCode>> GetChildrenAsync(Guid parentObjectId, CancellationToken cancellationToken = default)
    {
        var query = Query(c => c.ParentObjectId == parentObjectId && c.IsActive);
        return await ToListAsync(query, cancellationToken);
    }

    public async Task<List<ObjectChildCode>> GetDescendantsAsync(Guid parentObjectId, CancellationToken cancellationToken = default)
    {
        var descendants = new List<ObjectChildCode>();
        var queue = new Queue<Guid>();
        queue.Enqueue(parentObjectId);
        var visited = new HashSet<Guid> { parentObjectId };

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            var children = await GetChildrenAsync(currentId, cancellationToken);

            foreach (var child in children)
            {
                if (!visited.Contains(child.ChildObjectId))
                {
                    descendants.Add(child);
                    visited.Add(child.ChildObjectId);
                    queue.Enqueue(child.ChildObjectId);
                }
            }
        }

        return descendants;
    }

    public async Task<List<ObjectChildCode>> GetAncestorsAsync(Guid childObjectId, CancellationToken cancellationToken = default)
    {
        var ancestors = new List<ObjectChildCode>();
        var currentChildId = childObjectId;
        var visited = new HashSet<Guid> { childObjectId };

        while (true)
        {
            var parent = await FindAsync(c => c.ChildObjectId == currentChildId && c.IsActive, cancellationToken: cancellationToken);

            if (parent == null || visited.Contains(parent.ParentObjectId))
            {
                break;
            }

            ancestors.Add(parent);
            visited.Add(parent.ParentObjectId);
            currentChildId = parent.ParentObjectId;
        }

        return ancestors;
    }
}
