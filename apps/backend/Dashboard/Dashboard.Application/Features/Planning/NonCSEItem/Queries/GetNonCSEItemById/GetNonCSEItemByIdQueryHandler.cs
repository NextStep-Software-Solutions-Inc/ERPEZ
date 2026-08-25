using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Queries.GetNonCSEItemById;

public class GetNonCSEItemByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetNonCSEItemByIdQuery, ApiResponse<NonCSEItemResponse>>
{
    public async Task<ApiResponse<NonCSEItemResponse>> Handle(
        GetNonCSEItemByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdWithRelationsAsync(query.Id, cancellationToken);
        if (nonCseItem == null)
            throw new NotFoundException("Non-CSE Item not found.");

        var response = new NonCSEItemResponse
        {
            Id = nonCseItem.Id,
            Name = nonCseItem.Name,
            Description = nonCseItem.Description,
            UOMId = nonCseItem.UOMId,
            UOMName = nonCseItem.UOM?.Name,
            ItemRequestId = nonCseItem.ItemRequestId,
            ProductCode = nonCseItem.ProductCode,
            CurrentPrice = nonCseItem.CurrentPrice,
            Remarks = nonCseItem.Remarks,
            CreatedAt = nonCseItem.CreatedAt,
            CreatedBy = nonCseItem.CreatedBy
        };

        return ApiResponse<NonCSEItemResponse>.Success(response);
    }
}
