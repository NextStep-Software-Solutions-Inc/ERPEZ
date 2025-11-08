using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluationById;

public record class GetOPCREvaluationByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.OPCREvaluation>>;