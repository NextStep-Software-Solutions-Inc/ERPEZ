using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMById;

public class GetPerformanceMeasureByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetPerformanceMeasureByIdQuery, ApiResponse<Domain.Entities.Planning.PerformanceMeasure>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.PerformanceMeasure>> Handle(GetPerformanceMeasureByIdQuery request, CancellationToken cancellationToken)
    {
        var pm = await _unitOfWork.PerformanceMeasureRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.PerformanceMeasure>.Success(pm, "Retrieved successfully");
    }
}
