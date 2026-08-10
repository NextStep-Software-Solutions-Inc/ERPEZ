using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.UpdateStep;

public class UpdateStepCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateStepCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateStepCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.StepRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Step not found.");

        if (!string.IsNullOrEmpty(request.UpdateStep.Code) && request.UpdateStep.Code != entity.Code)
        {
            var existingStep = await unitOfWork.StepRepository.FindAsync(
                x => x.Code == request.UpdateStep.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingStep != null)
                throw new ConflictException("A Step with this Code already exists.");

            entity.Code = request.UpdateStep.Code;
        }

        if (!string.IsNullOrEmpty(request.UpdateStep.Name))
            entity.Name = request.UpdateStep.Name;

        if (request.UpdateStep.StepNumber.HasValue)
            entity.StepNumber = request.UpdateStep.StepNumber.Value;

        if (request.UpdateStep.MinStep.HasValue)
            entity.MinStep = request.UpdateStep.MinStep.Value;

        if (request.UpdateStep.MaxStep.HasValue)
            entity.MaxStep = request.UpdateStep.MaxStep.Value;

        if (request.UpdateStep.Description != null)
            entity.Description = request.UpdateStep.Description;

        if (request.UpdateStep.IsActive.HasValue)
            entity.IsActive = request.UpdateStep.IsActive.Value;

        // Validate MaxStep >= MinStep after updates
        if (entity.MaxStep < entity.MinStep)
            throw new ConflictException("MaxStep must be greater than or equal to MinStep.");

        unitOfWork.StepRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}

