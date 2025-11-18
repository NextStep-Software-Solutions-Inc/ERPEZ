using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Commands.UpdateLocation;

public sealed class UpdateLocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.Location>>
{
    public Guid Id { get; set; }
    public required UpdateLocationDto UpdateLocation { get; set; }
}
