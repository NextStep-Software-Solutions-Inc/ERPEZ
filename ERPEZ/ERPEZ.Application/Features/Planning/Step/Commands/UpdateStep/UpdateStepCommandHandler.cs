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

        if (!string.IsNullOrEmpty(request.Request.Code) && request.Request.Code != entity.Code)
        {
            var existingStep = await unitOfWork.StepRepository.FindAsync(
                x => x.Code == request.Request.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingStep != null)
                throw new ConflictException("A Step with this Code already exists.");

            entity.Code = request.Request.Code;
        }

        if (!string.IsNullOrEmpty(request.Request.Name))
            entity.Name = request.Request.Name;

        if (request.Request.StepNumber.HasValue)
            entity.StepNumber = request.Request.StepNumber.Value;

        if (request.Request.MinStep.HasValue)
            entity.MinStep = request.Request.MinStep.Value;

        if (request.Request.MaxStep.HasValue)
            entity.MaxStep = request.Request.MaxStep.Value;

        if (request.Request.Description != null)
            entity.Description = request.Request.Description;

        if (request.Request.IsActive.HasValue)
            entity.IsActive = request.Request.IsActive.Value;

        // Validate MaxStep >= MinStep after updates
        if (entity.MaxStep < entity.MinStep)
            throw new ConflictException("MaxStep must be greater than or equal to MinStep.");

        unitOfWork.StepRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
