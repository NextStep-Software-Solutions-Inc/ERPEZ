using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;

public record GetOPCRByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRDetailedResponse>>;
