using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Queries.GetKPIAssignmentById;

public class GetKPIAssignmentByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetKPIAssignmentByIdQuery, ApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIAssignment>> Handle(GetKPIAssignmentByIdQuery request, CancellationToken cancellationToken)
    {
        var kPIAssignment = await _unitOfWork.KPIAssignmentRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.KPIAssignment>.Success(kPIAssignment, "Retrieved successfully");
    }
}
