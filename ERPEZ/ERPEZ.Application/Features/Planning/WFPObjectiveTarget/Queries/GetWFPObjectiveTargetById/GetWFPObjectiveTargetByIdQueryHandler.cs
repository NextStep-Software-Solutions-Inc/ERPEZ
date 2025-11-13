using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Queries.GetWFPObjectiveTargetById;

public class GetWFPObjectiveTargetByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWFPObjectiveTargetByIdQuery, ApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetResponse>> Handle(GetWFPObjectiveTargetByIdQuery request, CancellationToken cancellationToken)
    {
        var wfpObjectiveTarget = await unitOfWork.WFPObjectiveTargetRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new WFPObjectiveTargetResponse()
        {
            Id = wfpObjectiveTarget.Id,
            WFPObjectiveId = wfpObjectiveTarget.WFPObjectiveId,
            ActivityName = wfpObjectiveTarget.ActivityName,
            Indicator = wfpObjectiveTarget.Indicator,
            Weight = wfpObjectiveTarget.Weight,
            CreatedAt = wfpObjectiveTarget.CreatedAt,
            CreatedBy = wfpObjectiveTarget.CreatedBy
        };
        return ApiResponse<WFPObjectiveTargetResponse>.Success(result, "Retrieved successfully");
    }
}
