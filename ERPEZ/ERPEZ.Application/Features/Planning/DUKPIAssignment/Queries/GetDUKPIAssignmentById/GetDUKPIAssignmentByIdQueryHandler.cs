using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Queries.GetDUKPIAssignmentById;

public class GetDUKPIAssignmentByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetDUKPIAssignmentByIdQuery, ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>> Handle(GetDUKPIAssignmentByIdQuery request, CancellationToken cancellationToken)
    {
        var kPIAssignment = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.DUKPIAssignment>.Success(kPIAssignment, "Retrieved successfully");
    }
}
