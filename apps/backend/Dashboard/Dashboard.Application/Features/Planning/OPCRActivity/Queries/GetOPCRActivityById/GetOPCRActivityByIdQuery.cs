using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;

public record GetOPCRActivityByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRActivityResponse>>;
