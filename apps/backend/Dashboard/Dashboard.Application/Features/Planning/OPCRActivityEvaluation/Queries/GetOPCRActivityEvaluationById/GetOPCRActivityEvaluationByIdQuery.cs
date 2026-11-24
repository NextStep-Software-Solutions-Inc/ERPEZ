using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluationById;

public record GetOPCRActivityEvaluationByIdQuery(Guid Id) : IRequest<ApiResponse<OPCRActivityEvaluationDetailedResponse>>;
