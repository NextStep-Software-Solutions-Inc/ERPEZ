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
                    TotalItems = activity.PPMPExpenditureItems
                        .Where(expenditure => !expenditure.IsDeleted)
                        .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                        .Count(),
                    TotalItemAllocations = activity.PPMPExpenditureItems
                        .Where(expenditure => !expenditure.IsDeleted)
                        .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                        .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                        .Count(),
                    TotalAllocationQuantity = activity.PPMPExpenditureItems
                        .Where(expenditure => !expenditure.IsDeleted)
                        .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                        .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                        .Sum(allocation => (int?)allocation.Quantity) ?? 0,
                    TotalAllocationAmount = activity.PPMPExpenditureItems
                        .Where(expenditure => !expenditure.IsDeleted)
                        .SelectMany(expenditure => expenditure.PPMPItems.Where(item => !item.IsDeleted))
                        .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
                        .Sum(allocation => (decimal?)allocation.Amount) ?? 0m,
                    CreatedAt = activity.CreatedAt,
                    CreatedBy = activity.CreatedBy
                }),
            cancellationToken);

        if (result == null)
            throw new NotFoundException("PPMP Activity not found.");

        return ApiResponse<PPMPActivityResponse>.Success(result);
    }
}
