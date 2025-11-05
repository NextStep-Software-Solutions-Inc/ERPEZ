using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartmentById;

public class GetOPCRPAPDepartmentByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetOPCRPAPDepartmentByIdQuery, ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>> Handle(GetOPCRPAPDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var oPCRPAPDepartment = await _unitOfWork.OPCRPAPDepartmentRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>.Success(oPCRPAPDepartment, "Retrieved successfully");
    }
}

