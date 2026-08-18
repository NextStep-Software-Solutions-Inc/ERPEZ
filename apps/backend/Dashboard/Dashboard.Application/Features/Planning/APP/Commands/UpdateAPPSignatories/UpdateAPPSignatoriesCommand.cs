using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.UpdateAPPSignatories;

public record UpdateAPPSignatoriesCommand : IRequest<ApiResponse<Unit>>
{
    public Guid APPId { get; init; }
    public UpdateAPPSignatoriesRequest Request { get; init; } = new();
}
