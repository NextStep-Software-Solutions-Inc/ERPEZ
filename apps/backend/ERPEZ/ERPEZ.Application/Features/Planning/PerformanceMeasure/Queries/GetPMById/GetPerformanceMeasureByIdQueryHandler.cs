using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMById;

public class GetPerformanceMeasureByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPerformanceMeasureByIdQuery, ApiResponse<PerformanceMeasureDetailedResponse>>
{
    public async Task<ApiResponse<PerformanceMeasureDetailedResponse>> Handle(GetPerformanceMeasureByIdQuery request, CancellationToken cancellationToken)
    {
        var pm = await unitOfWork.PerformanceMeasureRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new PerformanceMeasureDetailedResponse
        {
            Id = pm.Id,
            Name = pm.Name,
            Description = pm.Description,
            CreatedAt = pm.CreatedAt,
            CreatedBy = pm.CreatedBy,
            UpdatedAt = pm.UpdatedAt,
            UpdatedBy = pm.UpdatedBy
        };

        return ApiResponse<PerformanceMeasureDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
