using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.DeleteStep;

public class DeleteStepCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteStepCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteStepCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.StepRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Step not found.");

        unitOfWork.StepRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
