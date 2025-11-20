using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.DeleteAttribute;

public class DeleteAttributeCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
}
