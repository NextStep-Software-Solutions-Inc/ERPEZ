using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetObjectHierarchy;

/// <summary>
/// Query to get the full object hierarchy tree starting from a parent.
/// </summary>
public record GetObjectHierarchyQuery(Guid ObjectId) : IRequest<ApiResponse<ObjectHierarchyNode>>;
