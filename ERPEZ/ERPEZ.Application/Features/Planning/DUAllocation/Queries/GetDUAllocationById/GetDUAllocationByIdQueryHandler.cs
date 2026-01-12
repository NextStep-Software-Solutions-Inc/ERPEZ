using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;

public class GetDUAllocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationByIdQuery, ApiResponse<DUAllocationDetailedResponse>>
{
    public async Task<ApiResponse<DUAllocationDetailedResponse>> Handle(GetDUAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var utilizationQuery = unitOfWork.DUFundAllocationRepository
            .Query()
            .GroupBy(allocation => allocation.ReceivedFundId)
            .Select(grouping => new
            {
                ReceivedFundId = grouping.Key,
                UtilizedAmount = grouping.Sum(allocation => allocation.Amount)
            });

        var duAllocationQuery = unitOfWork.DUAllocationRepository
            .Query(t => t.Id == request.Id)
            .Select(duAllocation => new DUAllocationDetailedResponse
            {
                Id = duAllocation.Id,
                DeliveryUnit = new()
                {
                    Id = duAllocation.DeliveryUnit.Id,
                    ParentId = duAllocation.DeliveryUnit.ParentId,
                    Office = new()
                    {
                        Name = duAllocation.DeliveryUnit.Office.Name,
                        Address = duAllocation.DeliveryUnit.Office.Address,
                        ContactNumber = duAllocation.DeliveryUnit.Office.ContactNumber,
                        CreatedBy = duAllocation.DeliveryUnit.Office.CreatedBy,
                        CreatedAt = duAllocation.DeliveryUnit.Office.CreatedAt,
                        Email = duAllocation.DeliveryUnit.Office.Email,
                        Description = duAllocation.DeliveryUnit.Office.Description,
                        OfficeHead = duAllocation.DeliveryUnit.Office.OfficeHead,
                        ResponsibilityCenterCode = duAllocation.DeliveryUnit.Office.ResponsibilityCenterCode,
                        Cluster = duAllocation.DeliveryUnit.Office.Cluster == null ? null : new()
                        {
                            Id = duAllocation.DeliveryUnit.Office.Cluster.Id,
                            Name = duAllocation.DeliveryUnit.Office.Cluster.Name,
                            Description = duAllocation.DeliveryUnit.Office.Cluster.Description,
                            CreatedAt = duAllocation.DeliveryUnit.Office.Cluster.CreatedAt,
                            CreatedBy = duAllocation.DeliveryUnit.Office.Cluster.CreatedBy,
                        }
                    },
                    CreatedAt = duAllocation.DeliveryUnit.CreatedAt,
                },
                Purpose = duAllocation.Purpose,
                Amount = duAllocation.Amount,
                IsLocked = duAllocation.IsLocked,
                CreatedAt = duAllocation.CreatedAt,
                FundAllocations = duAllocation.DUFundAllocations
                    .Select(fundAllocation => new DUFundAllocationResponse
                    {
                        Id = fundAllocation.Id,
                        DUAllocationId = fundAllocation.DUAllocationId,
                        Amount = fundAllocation.Amount,
                        ReceivedFund = new()
                        {
                            Id = fundAllocation.ReceivedFund.Id,
                            Amount = fundAllocation.ReceivedFund.Amount,
                            UtilizedAmount = utilizationQuery
                                .Where(utilization => utilization.ReceivedFundId == fundAllocation.ReceivedFund.Id)
                                .Select(utilization => utilization.UtilizedAmount)
                                .FirstOrDefault(),
                            Description = fundAllocation.ReceivedFund.Description,
                            ReceivedDate = fundAllocation.ReceivedFund.ReceivedDate,
                            FundSource = new()
                            {
                                Id = fundAllocation.ReceivedFund.FundSource.Id,
                                Name = fundAllocation.ReceivedFund.FundSource.Name,
                                Code = fundAllocation.ReceivedFund.FundSource.Code,
                                Type = fundAllocation.ReceivedFund.FundSource.Type.ToString(),
                                IsActive = fundAllocation.ReceivedFund.FundSource.IsActive
                            }
                        }
                    })
                    .ToList()
            });

        var duAllocation = await unitOfWork.DUAllocationRepository.GetFirstAsync(duAllocationQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<DUAllocationDetailedResponse>.Success(duAllocation, "Retrieved successfully");
    }
}
