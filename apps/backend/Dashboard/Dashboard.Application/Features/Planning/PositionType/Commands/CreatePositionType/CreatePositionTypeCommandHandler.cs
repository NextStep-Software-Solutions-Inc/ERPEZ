using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.CreatePositionType;

public class CreatePositionTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePositionTypeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePositionTypeCommand request, CancellationToken cancellationToken)
    {
        var existing = await unitOfWork.PositionTypeRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"Position Type with code '{request.Code}' already exists.");

        var entity = new Domain.Entities.Planning.PositionType
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            EducationalLevel = request.EducationalLevel,
            Category = request.Category,
            IsCareerEligibilityRequired = request.IsCareerEligibilityRequired,
            CanReportDirectly = request.CanReportDirectly,
            IsActive = true
        };

        await unitOfWork.PositionTypeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
