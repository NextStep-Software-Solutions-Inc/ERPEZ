using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluationsBatch;

/// <summary>
/// Command for creating multiple OPCR Activity Evaluations in a single request.
/// </summary>
public class CreateOPCRActivityEvaluationsBatchCommand : IRequest<ApiResponse<Unit>>
{
    public List<CreateOPCRActivityEvaluationItemRequest> Evaluations { get; set; } = [];
}