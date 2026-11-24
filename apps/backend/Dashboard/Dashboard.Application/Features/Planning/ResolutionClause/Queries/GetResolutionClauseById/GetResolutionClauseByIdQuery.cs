using System;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauseById;

public record GetResolutionClauseByIdQuery(Guid Id) : IRequest<ApiResponse<ResolutionClauseResponse>>;
