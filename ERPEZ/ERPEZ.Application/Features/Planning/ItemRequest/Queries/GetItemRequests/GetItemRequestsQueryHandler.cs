using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequests;

public class GetItemRequestsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetItemRequestsQuery, PaginatedApiResponse<ItemRequestResponse>>
{
    public async Task<PaginatedApiResponse<ItemRequestResponse>> Handle(
        GetItemRequestsQuery query, 
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ItemRequest, ItemRequestResponse>> projection = 
            request => new ItemRequestResponse
            {
                Id = request.Id,
                OfficeId = request.OfficeId,
                OfficeName = request.Office.Name,
                Name = request.Name,
                ItemCategory = request.ItemCategory,
                Status = request.Status,
                EstimatedUnitCost = request.EstimatedUnitCost,
                UOMId = request.UOMId,
                UOMName = request.UOM != null ? request.UOM.Name : null,
                ProcurementCategoryId = request.ProcurementCategoryId,
                ProcurementCategoryName = request.ProcurementCategory != null ? request.ProcurementCategory.Name : null,
                TechnicalSpecification = request.TechnicalSpecification,
                TWGRemarks = request.TWGRemarks,
                UACSCode = request.UACSCode,
                UNSCPSCCode = request.UNSCPSCCode,
                RequestDate = request.RequestDate,
                ReviewedBy = request.ReviewedBy != null ? request.ReviewedBy.ToString() : null,
                SubmittedAt = request.SubmittedAt,
                ReviewedAt = request.ReviewedAt,
                CreatedAt = request.CreatedAt,
                CreatedBy = request.CreatedBy
            };

        var (requests, totalCount) = await unitOfWork.ItemRequestRepository.GetAllAsync(
            query.SieveModel,
            projection,
            cancellationToken);

        var pageNumber = query.SieveModel.Page ?? 1;
        var pageSize = query.SieveModel.PageSize ?? 10;

        return new PaginatedApiResponse<ItemRequestResponse>(requests.ToList(), totalCount, pageNumber, pageSize);
    }
}
