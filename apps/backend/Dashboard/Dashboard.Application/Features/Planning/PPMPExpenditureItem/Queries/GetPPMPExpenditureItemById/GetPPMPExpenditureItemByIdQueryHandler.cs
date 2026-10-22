using ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Queries.GetPPMPExpenditureItemById;

public class GetPPMPExpenditureItemByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPPMPExpenditureItemByIdQuery, ApiResponse<PPMPExpenditureItemResponse>>
{
    public async Task<ApiResponse<PPMPExpenditureItemResponse>> Handle(GetPPMPExpenditureItemByIdQuery query, CancellationToken cancellationToken)
    {
        var result = await unitOfWork.PPMPExpenditureItemRepository.GetSingleAsync(
            unitOfWork.PPMPExpenditureItemRepository.Query(x => x.Id == query.Id)
                .Select(item => new PPMPExpenditureItemResponse
                {
                    Id = item.Id,
                    PPMPActivityId = item.PPMPActivityId,
                    IsProcurable = item.IsProcurable,
                    TotalCost = item.TotalCost,
                    CreatedAt = item.CreatedAt,
                    CreatedBy = item.CreatedBy,
                    PPMPActivityName = item.PPMPActivity != null ? item.PPMPActivity.LIBActivity.Name : null // ← fix
                }),
            cancellationToken);

        if (result == null)
            throw new NotFoundException("PPMP Expenditure Item not found.");

        return ApiResponse<PPMPExpenditureItemResponse>.Success(result);
    }
}
