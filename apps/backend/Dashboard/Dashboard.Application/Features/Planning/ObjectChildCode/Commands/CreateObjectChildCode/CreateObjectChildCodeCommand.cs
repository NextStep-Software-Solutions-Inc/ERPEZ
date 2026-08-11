using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.CreateObjectChildCode;

/// <summary>
/// Command to create a child object relationship.
/// </summary>
public class CreateObjectChildCodeCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid ParentObjectId { get; init; }
    public required Guid ChildObjectId { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public string? Description { get; init; }
    public Guid? AgencyId { get; init; }
    public bool IsActive { get; init; } = true;
}
