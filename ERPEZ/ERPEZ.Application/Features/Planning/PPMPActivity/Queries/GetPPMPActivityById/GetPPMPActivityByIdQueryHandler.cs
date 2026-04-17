using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivityById;

public class GetPPMPActivityByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPActivityByIdQuery, ApiResponse<PPMPActivityResponse>>
{
    public async Task<ApiResponse<PPMPActivityResponse>> Handle(GetPPMPActivityByIdQuery query, CancellationToken cancellationToken)
    {
        var result = await unitOfWork.PPMPActivityRepository.GetSingleAsync(
            unitOfWork.PPMPActivityRepository.Query(x => x.Id == query.Id)
                .Select(activity => new PPMPActivityResponse
                {
                    Id = activity.Id,
                    PPMPId = activity.PPMPId,
                    LIBActivityId = activity.LIBActivityId,
                    ActivityName = activity.LIBActivity.Name,
                    CreatedAt = activity.CreatedAt,
                    CreatedBy = activity.CreatedBy
                }),
            cancellationToken);

        if (result == null)
            throw new NotFoundException("PPMP Activity not found.");

        return ApiResponse<PPMPActivityResponse>.Success(result);
    }
}
