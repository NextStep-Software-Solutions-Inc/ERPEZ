using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypeById;

public class GetPositionTypeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionTypeByIdQuery, ApiResponse<PositionTypeResponse>>
{
    public async Task<ApiResponse<PositionTypeResponse>> Handle(GetPositionTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PositionTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Position Type with ID '{request.Id}' not found.");

        var response = new PositionTypeResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            EducationalLevel = entity.EducationalLevel,
            Category = entity.Category,
            IsCareerEligibilityRequired = entity.IsCareerEligibilityRequired,
            CanReportDirectly = entity.CanReportDirectly,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<PositionTypeResponse>.Success(response);
    }
}
