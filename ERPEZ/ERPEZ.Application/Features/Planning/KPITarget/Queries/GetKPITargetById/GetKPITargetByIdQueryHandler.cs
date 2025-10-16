using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargetById;

public class GetKPITargetByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPITargetByIdQuery, ApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPITarget>> Handle(GetKPITargetByIdQuery request, CancellationToken cancellationToken)
    {
        var kpiTarget = await _unitOfWork.KPITargetRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.KPITarget>.Success(kpiTarget, "Retrieved successfully");
    }
}
