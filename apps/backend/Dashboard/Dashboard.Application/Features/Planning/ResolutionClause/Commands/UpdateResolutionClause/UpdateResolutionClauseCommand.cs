using System;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.UpdateResolutionClause;

public record UpdateResolutionClauseCommand(Guid Id, UpdateResolutionClauseRequest Request) : IRequest<ApiResponse<Unit>>;
