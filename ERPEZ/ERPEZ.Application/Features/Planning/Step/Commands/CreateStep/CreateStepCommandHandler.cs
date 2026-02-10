using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.CreateStep;

public class CreateStepCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateStepCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateStepCommand request, CancellationToken cancellationToken)
    {
        var existingStep = await unitOfWork.StepRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existingStep != null)
            throw new ConflictException("A Step with this Code already exists.");

        var entity = new Domain.Entities.Planning.Step
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            StepNumber = request.StepNumber,
            MinStep = request.MinStep,
            MaxStep = request.MaxStep,
            Description = request.Description,
            IsActive = true
        };

        await unitOfWork.StepRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
