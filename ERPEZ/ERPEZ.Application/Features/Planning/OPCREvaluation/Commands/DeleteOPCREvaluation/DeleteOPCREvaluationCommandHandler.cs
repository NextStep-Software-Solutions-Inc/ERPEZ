using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.DeleteOPCREvaluation;

public class DeleteOPCREvaluationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCREvaluationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCREvaluationCommand request, CancellationToken cancellationToken)
    {
        var opcrEvaluation = await unitOfWork.OPCREvaluationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR Evaluation not found.");

        unitOfWork.OPCREvaluationRepository.Remove(opcrEvaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}