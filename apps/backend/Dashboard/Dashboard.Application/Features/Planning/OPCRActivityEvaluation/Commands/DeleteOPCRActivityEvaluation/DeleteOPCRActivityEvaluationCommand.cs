using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.DeleteOPCRActivityEvaluation;

public record DeleteOPCRActivityEvaluationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
