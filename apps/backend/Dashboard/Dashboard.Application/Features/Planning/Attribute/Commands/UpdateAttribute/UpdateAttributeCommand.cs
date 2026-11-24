using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;

public record UpdateAttributeCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public Guid? ParentAttributeId { get; init; }
}
