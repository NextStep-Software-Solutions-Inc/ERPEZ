using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluation;

public class UpdateOPCRActivityEvaluationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRActivityEvaluationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityEvaluationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateEvaluation;

        var evaluation = await unitOfWork.OPCRActivityEvaluationRepository.GetByIdWithDetailsAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Evaluation not found.");

        // Update only provided fields
        if (dto.EvaluatorScore.HasValue)
            evaluation.EvaluatorScore = dto.EvaluatorScore.Value;

        if (dto.Remarks is not null)
            evaluation.Remarks = dto.Remarks;

        if (dto.EvaluatedDate.HasValue)
            evaluation.EvaluatedDate = dto.EvaluatedDate;

        if (dto.Status.HasValue)
            evaluation.Status = dto.Status.Value;

        unitOfWork.OPCRActivityEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity Evaluation updated successfully.");
    }
}
