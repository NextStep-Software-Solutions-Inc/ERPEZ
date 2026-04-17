using ERPEZ.Application.Features.Planning.ItemRequest.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ItemRequest.Queries.GetItemRequests;

public class GetItemRequestsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetItemRequestsQuery, PaginatedApiResponse<ItemRequestResponse>>
{
    public async Task<PaginatedApiResponse<ItemRequestResponse>> Handle(
        GetItemRequestsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

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
            sieveModel,
            projection,
            cancellationToken);

        return new PaginatedApiResponse<ItemRequestResponse>(requests.ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}
