using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequestById;

public class GetItemRequestByIdQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetItemRequestByIdQuery, ApiResponse<ItemRequestResponse>>
{
    public async Task<ApiResponse<ItemRequestResponse>> Handle(
        GetItemRequestByIdQuery query, 
        CancellationToken cancellationToken)
    {
        var itemRequest = await unitOfWork.ItemRequestRepository.GetByIdAsync(query.Id, cancellationToken);
        if (itemRequest == null)
            throw new NotFoundException("Item Request not found.");

        var response = new ItemRequestResponse
        {
            Id = itemRequest.Id,
            OfficeId = itemRequest.OfficeId,
            OfficeName = itemRequest.Office?.Name ?? string.Empty,
            Name = itemRequest.Name,
            ItemCategory = itemRequest.ItemCategory,
            Status = itemRequest.Status,
            EstimatedUnitCost = itemRequest.EstimatedUnitCost,
            UOMId = itemRequest.UOMId,
            UOMName = itemRequest.UOM?.Name,
            ProcurementCategoryId = itemRequest.ProcurementCategoryId,
            ProcurementCategoryName = itemRequest.ProcurementCategory?.Name,
            TechnicalSpecification = itemRequest.TechnicalSpecification,
            TWGRemarks = itemRequest.TWGRemarks,
            UACSCode = itemRequest.UACSCode,
            UNSCPSCCode = itemRequest.UNSCPSCCode,
            RequestDate = itemRequest.RequestDate,
            ReviewedBy = itemRequest.ReviewedBy?.ToString(),
            SubmittedAt = itemRequest.SubmittedAt,
            ReviewedAt = itemRequest.ReviewedAt,
            CreatedAt = itemRequest.CreatedAt,
            CreatedBy = itemRequest.CreatedBy
        };

        return ApiResponse<ItemRequestResponse>.Success(response);
    }
}
