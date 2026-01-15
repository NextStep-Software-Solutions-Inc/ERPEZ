using ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Queries.GetOPCRActivityEvaluationById;

public class GetOPCRActivityEvaluationByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityEvaluationByIdQuery, ApiResponse<OPCRActivityEvaluationDetailedResponse>>
{
    public async Task<ApiResponse<OPCRActivityEvaluationDetailedResponse>> Handle(
        GetOPCRActivityEvaluationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var evaluation = await unitOfWork.OPCRActivityEvaluationRepository.GetByIdWithDetailsAsync(
            request.Id,
            cancellationToken) ?? throw new NotFoundException("OPCR Activity Evaluation not found.");

        var result = new OPCRActivityEvaluationDetailedResponse
        {
            Id = evaluation.Id,
            OPCRActivityRatingId = evaluation.OPCRActivityRatingId,
            OPCRActivityId = evaluation.OPCRActivityRating?.OPCRActivityId ?? Guid.Empty,
            OPCRActivityName = evaluation.OPCRActivityRating?.OPCRActivity?.Name ?? string.Empty,
            SelfRatingScore = evaluation.OPCRActivityRating?.Score ?? 0,
            EvaluatorScore = evaluation.EvaluatorScore,
            Remarks = evaluation.Remarks,
            EvaluatedDate = evaluation.EvaluatedDate,
            Status = evaluation.Status,
            CreatedAt = evaluation.CreatedAt,
            CreatedBy = evaluation.CreatedBy
        };

        return ApiResponse<OPCRActivityEvaluationDetailedResponse>.Success(result, "Retrieved successfully.");
    }
}
