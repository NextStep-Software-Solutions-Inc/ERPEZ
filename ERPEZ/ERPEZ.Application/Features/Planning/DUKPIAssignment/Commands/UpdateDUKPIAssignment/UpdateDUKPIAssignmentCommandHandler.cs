using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentDto>>
{
    public async Task<ApiResponse<DUKPIAssignmentDto>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUKPIAssignment;
        var dukpi = await unitOfWork.DUKPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("DU KPI Assignment not found.");

        var duplicate = await unitOfWork.DUKPIAssignmentRepository.FindAsync(
            x => x.AllocatedTargetValue == dto.AllocatedTargetValue,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("DU KPI Assignment already exists.");

        dukpi.AllocatedTargetValue = dto.AllocatedTargetValue;

        unitOfWork.DUKPIAssignmentRepository.Update(dukpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new DUKPIAssignmentDto
        {
            Id = dukpi.Id,
            DeliveryUnitId = dukpi.DeliveryUnitId,
            KPITargetId = dukpi.KPITargetId,
            AllocatedTargetValue = dto.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentDto>.Success(result, "WFP Objective updated successfully.");
    }
}
