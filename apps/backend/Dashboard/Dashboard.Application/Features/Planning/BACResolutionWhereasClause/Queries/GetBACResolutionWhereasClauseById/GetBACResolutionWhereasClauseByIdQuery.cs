using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauseById;

public record GetBACResolutionWhereasClauseByIdQuery(Guid Id) : IRequest<ApiResponse<BACResolutionWhereasClauseResponse>>;
