using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluationById;

public record class GetOPCREvaluationByIdQuery(Guid Id) : IRequest<ApiResponse<OPCREvaluationResponse>>;
