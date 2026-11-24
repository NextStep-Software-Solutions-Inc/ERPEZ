using ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Queries.GetDUKPITargetAssignmentById;

public class GetDUKPITargetAssignmentByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUKPITargetAssignmentByIdQuery, ApiResponse<DUKPITargetAssignmentResponse>>
{
    public async Task<ApiResponse<DUKPITargetAssignmentResponse>> Handle(GetDUKPITargetAssignmentByIdQuery request, CancellationToken cancellationToken)
    {
        var duKpiTargetAssignmentQuery = unitOfWork.DUKPITargetAssignmentRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new DUKPITargetAssignmentResponse
            {
                Id = t.Id,
                KPIId = t.KPIId,
                DeliveryUnitId = t.DeliveryUnitId,
                AllocatedTargetValue = t.AllocatedTargetValue,
                TargetId = t.KPITargetId
            });
            
        var kPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.GetFirstAsync(duKpiTargetAssignmentQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<DUKPITargetAssignmentResponse>.Success(kPITargetAssignment, "Retrieved successfully");
    }
}
