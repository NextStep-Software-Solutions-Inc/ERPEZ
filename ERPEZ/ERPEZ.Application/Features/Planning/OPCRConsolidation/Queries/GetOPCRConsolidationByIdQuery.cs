using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Queries;

public record GetOPCRConsolidationByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRConsolidationDetailedResponse>>;