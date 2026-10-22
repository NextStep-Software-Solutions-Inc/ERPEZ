using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeHierarchy;

public record GetOfficeHierarchyQuery : IRequest<ApiResponse<List<OfficeHierarchyResponse>>>
{
    /// <summary>
    /// Optional root office ID to get a subtree. If null, returns full hierarchy from top-level offices.
    /// </summary>
    public Guid? RootOfficeId { get; init; }
    
    /// <summary>
    /// Whether to include soft-deleted offices in the hierarchy.
    /// </summary>
    public bool IncludeDeleted { get; init; } = false;
}
