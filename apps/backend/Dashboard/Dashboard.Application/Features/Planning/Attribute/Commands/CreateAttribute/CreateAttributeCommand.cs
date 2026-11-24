using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.CreateAttribute;

public record CreateAttributeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public Guid? ParentAttributeId { get; init; }
}
