using ERPEZ.Application.Features.Planning.Location.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Location.Queries.GetLocationById;

public record GetLocationByIdQuery(Guid Id) : IRequest<ApiResponse<LocationDetailedResponse>>;
