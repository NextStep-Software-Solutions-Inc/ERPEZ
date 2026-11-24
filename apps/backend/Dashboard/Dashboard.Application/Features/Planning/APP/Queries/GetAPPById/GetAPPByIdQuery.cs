using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPById;

public record GetAPPByIdQuery(Guid Id) : IRequest<ApiResponse<APPResponse>>;
