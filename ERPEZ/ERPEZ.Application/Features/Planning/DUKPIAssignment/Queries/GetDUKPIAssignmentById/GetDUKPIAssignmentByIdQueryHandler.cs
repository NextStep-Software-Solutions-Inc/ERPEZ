using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignmentById;

public class GetDUKPIAssignmentByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUKPIAssignmentByIdQuery, ApiResponse<DUKPIAssignmentResponse>>
{
    public async Task<ApiResponse<DUKPIAssignmentResponse>> Handle(GetDUKPIAssignmentByIdQuery request, CancellationToken cancellationToken)
    {
        var duKpiAssignmentQuery = unitOfWork.DUKPIAssignmentRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new DUKPIAssignmentResponse
            {
                Id = t.Id,
                KPIId = t.KPIId,
                DeliveryUnitId = t.DeliveryUnitId,
                AllocatedTargetValue = t.AllocatedTargetValue,
                TargetId = t.KPITargetId
            });
            
        var kPIAssignment = await unitOfWork.DUKPIAssignmentRepository.GetFirstAsync(duKpiAssignmentQuery, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<DUKPIAssignmentResponse>.Success(kPIAssignment, "Retrieved successfully");
    }
}
