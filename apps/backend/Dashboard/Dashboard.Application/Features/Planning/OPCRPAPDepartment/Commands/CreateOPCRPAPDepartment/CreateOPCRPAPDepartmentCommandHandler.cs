using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Validators;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;

public class CreateOPCRPAPDepartmentCommandHandler(
    IUnitOfWork unitOfWork,
    IOPCRPAPDepartmentOfficeValidator officeValidator) : IRequestHandler<CreateOPCRPAPDepartmentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOPCRPAPDepartmentCommand request, CancellationToken cancellationToken)
    {
        await officeValidator.ValidateForOPCRActivityAsync(request.OPCRActivityId, [request.OfficeId], cancellationToken);

        var opcrPAPDeptExist = await unitOfWork.OPCRPAPDepartmentRepository.FindAsync(x => x.OPCRActivityId == request.OPCRActivityId && x.OfficeId == request.OfficeId, cancellationToken);
        if (opcrPAPDeptExist != null)
            throw new ConflictException("OPCR PAP Department with the same OPCR Activity and Office already exists.");

        var oPCRPAPDepartment = new Domain.Entities.Planning.OPCRPAPDepartment
        {
            OPCRActivityId = request.OPCRActivityId,
            OfficeId = request.OfficeId
        };

        await unitOfWork.OPCRPAPDepartmentRepository.AddAsync(oPCRPAPDepartment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(oPCRPAPDepartment.Id, "OPCR PAP Department created successfully.");
    }
}
