using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.DeleteResolutionClause;

public record DeleteResolutionClauseCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
