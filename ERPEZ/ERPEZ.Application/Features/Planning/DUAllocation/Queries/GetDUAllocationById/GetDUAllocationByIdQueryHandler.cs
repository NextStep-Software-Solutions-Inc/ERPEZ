using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocationById;

public class GetDUAllocationByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationByIdQuery, ApiResponse<DUAllocationResponse>>
{
    public async Task<ApiResponse<DUAllocationResponse>> Handle(GetDUAllocationByIdQuery request, CancellationToken cancellationToken)
    {
        var duAllocationQuery = unitOfWork.DUAllocationRepository
            .Query(t => t.Id == request.Id)
            .Select(duAllocation => new DUAllocationResponse
            {
                Id = duAllocation.Id,
                DeliveryUnit = new()
                {
                    Id = duAllocation.DeliveryUnit.Id,
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
            });
        var duAllocation = await unitOfWork.DUAllocationRepository.GetFirstAsync(duAllocationQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<DUAllocationResponse>.Success(duAllocation, "Retrieved successfully");
    }
}
