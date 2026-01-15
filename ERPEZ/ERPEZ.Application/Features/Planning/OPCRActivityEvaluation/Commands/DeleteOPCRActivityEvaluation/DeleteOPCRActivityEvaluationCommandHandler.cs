using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.DeleteOPCRActivityEvaluation;

public class DeleteOPCRActivityEvaluationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRActivityEvaluationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRActivityEvaluationCommand request, CancellationToken cancellationToken)
    {
        var evaluation = await unitOfWork.OPCRActivityEvaluationRepository.GetByIdAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Evaluation not found.");

        unitOfWork.OPCRActivityEvaluationRepository.Remove(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity Evaluation deleted successfully.");
    }
}
