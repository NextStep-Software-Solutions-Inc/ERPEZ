using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;

public record UpdateAttributeCommand(Guid Id, string Name, string? Code, string? Description, Guid? ParentAttributeId) : IRequest<ApiResponse<Unit>>;
