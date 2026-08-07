using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAvailablePPMPItems;

public class GetAvailablePPMPItemsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAvailablePPMPItemsQuery, ApiResponse<List<PPMPItemResponse>>>
{
    public async Task<ApiResponse<List<PPMPItemResponse>>> Handle(
        GetAvailablePPMPItemsQuery request,
        CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var ppmpIds = app.APPPPMPs
            .Where(link => !link.IsDeleted)
            .Select(link => link.PPMPId)
            .Distinct()
            .ToList();

        if (ppmpIds.Count == 0)
        {
            return ApiResponse<List<PPMPItemResponse>>.Success([]);
        }

        var entities = await unitOfWork.PPMPItemRepository.GetItemsByPpmpIdsAsync(ppmpIds, cancellationToken);
        var filteredItems = entities.Select(PPMPQueryProjection.BuildItemResponse).ToList();

        return ApiResponse<List<PPMPItemResponse>>.Success(filteredItems);
    }
}
