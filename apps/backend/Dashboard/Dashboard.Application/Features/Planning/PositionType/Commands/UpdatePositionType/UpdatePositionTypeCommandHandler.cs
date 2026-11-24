using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;

public class UpdatePositionTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePositionTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePositionTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PositionTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Position Type with ID '{request.Id}' not found.");

        if (!string.IsNullOrEmpty(request.UpdatePositionType.Code) && request.UpdatePositionType.Code != entity.Code)
        {
            var existing = await unitOfWork.PositionTypeRepository.FindAsync(
                x => x.Code == request.UpdatePositionType.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Position Type with code '{request.UpdatePositionType.Code}' already exists.");

            entity.Code = request.UpdatePositionType.Code;
        }

        if (!string.IsNullOrEmpty(request.UpdatePositionType.Name))
            entity.Name = request.UpdatePositionType.Name;

        if (request.UpdatePositionType.Description != null)
            entity.Description = request.UpdatePositionType.Description;

        if (request.UpdatePositionType.EducationalLevel != null)
            entity.EducationalLevel = request.UpdatePositionType.EducationalLevel;

        if (request.UpdatePositionType.Category != null)
            entity.Category = request.UpdatePositionType.Category;

        if (request.UpdatePositionType.IsCareerEligibilityRequired.HasValue)
            entity.IsCareerEligibilityRequired = request.UpdatePositionType.IsCareerEligibilityRequired.Value;

        if (request.UpdatePositionType.CanReportDirectly.HasValue)
            entity.CanReportDirectly = request.UpdatePositionType.CanReportDirectly.Value;

        if (request.UpdatePositionType.IsActive.HasValue)
            entity.IsActive = request.UpdatePositionType.IsActive.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}

