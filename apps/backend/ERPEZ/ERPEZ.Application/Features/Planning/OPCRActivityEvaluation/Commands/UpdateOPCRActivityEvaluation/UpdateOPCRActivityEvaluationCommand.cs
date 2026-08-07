using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluation;

public class UpdateOPCRActivityEvaluationCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public required UpdateOPCRActivityEvaluationRequest UpdateEvaluation { get; set; }
}
