using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.CreateAttribute;

public record CreateAttributeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? ParentAttributeId { get; set; }
}
