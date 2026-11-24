using ERPEZ.Application.Features.Planning.UOM.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMById;

public record GetUOMByIdQuery(Guid Id) : IRequest<ApiResponse<UOMResponse>>;
