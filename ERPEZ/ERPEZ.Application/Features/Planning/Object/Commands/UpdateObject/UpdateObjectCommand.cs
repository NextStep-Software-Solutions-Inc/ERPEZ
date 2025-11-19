using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;

public class UpdateObjectCommand : IRequest<ApiResponse<ObjectDto>>
{
    public Guid Id { get; set; }
    public required UpdateObjectDto UpdateObject { get; set; }
}
