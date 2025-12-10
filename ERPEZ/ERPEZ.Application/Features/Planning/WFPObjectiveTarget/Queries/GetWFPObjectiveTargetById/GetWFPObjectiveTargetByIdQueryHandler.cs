using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;

public class GetWFPObjectiveTargetByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetWFPObjectiveTargetByIdQuery, ApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>> Handle(
        GetWFPObjectiveTargetByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var target = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Activity not found.");

        return ApiResponse<Domain.Entities.Planning.WFPObjectiveTarget>.Success(target, "Retrieved successfully.");
    }
}
