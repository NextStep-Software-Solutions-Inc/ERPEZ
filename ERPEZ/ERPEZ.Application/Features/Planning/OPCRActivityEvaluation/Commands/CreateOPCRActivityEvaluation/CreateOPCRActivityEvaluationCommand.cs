using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.CreateOPCRActivityEvaluation;

public class CreateOPCRActivityEvaluationCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid OPCRActivityRatingId { get; set; }
    public int EvaluatorScore { get; set; }
    public string? Remarks { get; set; }
}
