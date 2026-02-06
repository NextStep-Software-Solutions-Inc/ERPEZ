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

        if (!string.IsNullOrEmpty(request.Request.Code) && request.Request.Code != entity.Code)
        {
            var existing = await unitOfWork.PositionTypeRepository.FindAsync(
                x => x.Code == request.Request.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Position Type with code '{request.Request.Code}' already exists.");

            entity.Code = request.Request.Code;
        }

        if (!string.IsNullOrEmpty(request.Request.Name))
            entity.Name = request.Request.Name;

        if (request.Request.Description != null)
            entity.Description = request.Request.Description;

        if (request.Request.EducationalLevel != null)
            entity.EducationalLevel = request.Request.EducationalLevel;

        if (request.Request.Category != null)
            entity.Category = request.Request.Category;

        if (request.Request.IsCareerEligibilityRequired.HasValue)
            entity.IsCareerEligibilityRequired = request.Request.IsCareerEligibilityRequired.Value;

        if (request.Request.CanReportDirectly.HasValue)
            entity.CanReportDirectly = request.Request.CanReportDirectly.Value;

        if (request.Request.IsActive.HasValue)
            entity.IsActive = request.Request.IsActive.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
