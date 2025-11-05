using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivityById;

public class GetWFPActivityByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetWFPActivityByIdQuery, ApiResponse<Domain.Entities.Planning.WFPActivity>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPActivity>> Handle(GetWFPActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpActivity = await _unitOfWork.WFPActivityRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.WFPActivity>.Success(wfpActivity, "Retrieved successfully");
    }
}
