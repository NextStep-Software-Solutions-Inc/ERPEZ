using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

public class DeleteOPCRPAPDepartmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteOPCRPAPDepartmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRPAPDepartmentCommand request, CancellationToken cancellationToken)
    {
        var oPCRPAPDepartment = await unitOfWork.OPCRPAPDepartmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR PAP Department not found.");

        unitOfWork.OPCRPAPDepartmentRepository.Remove(oPCRPAPDepartment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR PAP Department with ID {request.Id} deleted successfully.");
    }
}
