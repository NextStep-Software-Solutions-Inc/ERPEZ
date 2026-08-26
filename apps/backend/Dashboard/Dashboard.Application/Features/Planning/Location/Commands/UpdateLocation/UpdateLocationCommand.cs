using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;

public sealed class UpdateLocationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateLocationRequest UpdateLocation { get; set; }
}
