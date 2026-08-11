using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Queries.GetStepById;

public class GetStepByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetStepByIdQuery, ApiResponse<StepResponse>>
{
    public async Task<ApiResponse<StepResponse>> Handle(GetStepByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.StepRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Step not found.");

        var response = new StepResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            StepNumber = entity.StepNumber,
            MinStep = entity.MinStep,
            MaxStep = entity.MaxStep,
            Description = entity.Description,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<StepResponse>.Success(response);
    }
}
