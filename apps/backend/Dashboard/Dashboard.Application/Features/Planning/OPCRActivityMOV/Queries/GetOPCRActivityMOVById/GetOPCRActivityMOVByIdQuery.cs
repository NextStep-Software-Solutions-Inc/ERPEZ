using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVById;

public record GetOPCRActivityMOVByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRActivityMOVDetailedResponse>>;
