using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;

/// <summary>
/// Handler for updating OPCR Activity Evaluation status with transition validation.
/// </summary>
public class UpdateOPCRActivityEvaluationStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRActivityEvaluationStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityEvaluationStatusCommand request, CancellationToken cancellationToken)
    {
        var evaluation = await unitOfWork.OPCRActivityEvaluationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Evaluation not found.");

        // Convert string to enum (validation already done in validator)
        var status = Enum.Parse<Domain.Enums.OPCREvaluationStatus>(request.StatusString, true);

        // Update the status
        evaluation.Status = status;

        unitOfWork.OPCRActivityEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR Activity Evaluation status updated to {status} successfully.");
    }
}