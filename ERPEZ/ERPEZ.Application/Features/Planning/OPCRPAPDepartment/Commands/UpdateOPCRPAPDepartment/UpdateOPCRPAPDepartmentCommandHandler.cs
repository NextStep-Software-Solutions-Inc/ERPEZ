using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.UpdateOPCRPAPDepartment;

public class UpdateOPCRPAPDepartmentCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOPCRPAPDepartmentCommand, ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>> Handle(UpdateOPCRPAPDepartmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRPAPDepartment;
        if (dto.OPCRActivityId != null)
        {
            _ = await _unitOfWork.OPCRActivityRepository.FindAsync(
                x => x.Id == dto.OPCRActivityId,
                cancellationToken
            ) ?? throw new NotFoundException("OPCR Activity not found.");
        }
        if (dto.DeliveryUnitId != null)
        {
            _ = await _unitOfWork.DeliveryUnitRepository.FindAsync(
                x => x.Id == dto.DeliveryUnitId,
                cancellationToken
            ) ?? throw new NotFoundException("Delivery Unit not found.");
        }

        var oPCRPAPDepartment = await _unitOfWork.OPCRPAPDepartmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR KPI not found.");

        oPCRPAPDepartment.OPCRActivityId = dto.OPCRActivityId ?? oPCRPAPDepartment.OPCRActivityId;
        oPCRPAPDepartment.DeliveryUnitId = dto.DeliveryUnitId ?? oPCRPAPDepartment.DeliveryUnitId;

        _unitOfWork.OPCRPAPDepartmentRepository.Update(oPCRPAPDepartment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.OPCRPAPDepartment>.Success(oPCRPAPDepartment, "OPCR PAP Department updated successfully.");
    }
}
