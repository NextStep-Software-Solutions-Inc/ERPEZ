using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItemById;

public class GetPPMPItemByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemByIdQuery, ApiResponse<PPMPItemResponse>>
{
    public async Task<ApiResponse<PPMPItemResponse>> Handle(
        GetPPMPItemByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken);
        if (ppmpItem == null)
            throw new NotFoundException("PPMP Item not found.");

        return ApiResponse<PPMPItemResponse>.Success(PPMPQueryProjection.BuildItemResponse(ppmpItem));
    }
}
