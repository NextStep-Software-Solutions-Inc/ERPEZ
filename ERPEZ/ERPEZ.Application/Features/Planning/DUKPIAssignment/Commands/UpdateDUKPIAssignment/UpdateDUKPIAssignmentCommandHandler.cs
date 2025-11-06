using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<Domain.Entities.Planning.DUKPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DUKPIAssignment>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUKPIAssignment;

        if (dto.DeliveryUnitId.HasValue && dto.DeliveryUnitId.Value != Guid.Empty)
        {
            var du = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(dto.DeliveryUnitId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Delivery Unit not found.");
        }

        var kpiAssignment = await _unitOfWork.DUKPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("DU KPI Assignment not found.");

        var duplicate = await _unitOfWork.DUKPIAssignmentRepository
            .FindAsync(x => x.DeliveryUnitId == dto!.DeliveryUnitId && x.KPIId == dto.KPIId, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("DU KPI Assignment with the same KPI and Delivery Unit already exists.");

        kpiAssignment.DeliveryUnitId = dto?.DeliveryUnitId ?? kpiAssignment.DeliveryUnitId;
        kpiAssignment.KPIId = dto?.KPIId ?? kpiAssignment.KPIId;

        _unitOfWork.DUKPIAssignmentRepository.Update(kpiAssignment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.DUKPIAssignment>.Success(kpiAssignment, "DU KPI Assignment updated successfully.");
    }
}