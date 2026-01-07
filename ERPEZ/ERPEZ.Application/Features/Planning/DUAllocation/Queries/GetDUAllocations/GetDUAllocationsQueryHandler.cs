using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocations;

public class GetDUAllocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationsQuery, PaginatedApiResponse<DUAllocationResponse>>
{
    public async Task<PaginatedApiResponse<DUAllocationResponse>> Handle(GetDUAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.DUAllocation, DUAllocationResponse>> projection = du => new DUAllocationResponse
        {
            Id = du.Id,
            DeliveryUnit = new ()
            {
                Id = du.DeliveryUnit.Id,
                Office = new ()
                {
                    Id = du.DeliveryUnit.Office.Id,
                    Name = du.DeliveryUnit.Office.Name,
                    Address = du.DeliveryUnit.Office.Address,
                    ContactNumber = du.DeliveryUnit.Office.ContactNumber,
                    CreatedBy = du.DeliveryUnit.Office.CreatedBy,
                    CreatedAt = du.DeliveryUnit.Office.CreatedAt,
                    Email = du.DeliveryUnit.Office.Email,
                    Description = du.DeliveryUnit.Office.Description,
                    OfficeHead = du.DeliveryUnit.Office.OfficeHead,
                    
                    ResponsibilityCenterCode = du.DeliveryUnit.Office.ResponsibilityCenterCode,
                    Cluster = du.DeliveryUnit.Office.Cluster == null ? null : new()
                    {
                        Id = du.DeliveryUnit.Office.Cluster.Id,
                        Name = du.DeliveryUnit.Office.Cluster.Name,
                        Description = du.DeliveryUnit.Office.Cluster.Description,
                        CreatedAt = du.DeliveryUnit.Office.Cluster.CreatedAt,
                        CreatedBy = du.DeliveryUnit.Office.Cluster.CreatedBy,
                    }
                },
                ParentId = du.DeliveryUnit.ParentId,
                CreatedAt = du.DeliveryUnit.CreatedAt,
            },
            Purpose = du.Purpose,
            Amount = du.Amount,
            IsLocked = du.IsLocked,
        };
        var (duallocations, totalCount) = await unitOfWork.DUAllocationRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
       
        return new PaginatedApiResponse<DUAllocationResponse>(
            [..duallocations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
