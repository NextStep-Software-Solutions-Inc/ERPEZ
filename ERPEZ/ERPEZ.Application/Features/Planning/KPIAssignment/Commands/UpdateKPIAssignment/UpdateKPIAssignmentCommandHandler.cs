using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateKPIAssignmentCommand, ApiResponse<Domain.Entities.Planning.KPIAssignment>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.KPIAssignment>> Handle(UpdateKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateKPIAssignment;

        if (dto.DeliveryUnitId.HasValue && dto.DeliveryUnitId.Value != Guid.Empty)
        {
            var du = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(dto.DeliveryUnitId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Delivery Unit not found.");
        }

        var kpiAssignment = await _unitOfWork.KPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Assignment not found.");

        var duplicate = await _unitOfWork.KPIAssignmentRepository
            .FindAsync(x => x.DeliveryUnitId == dto!.DeliveryUnitId && x.KPIId == dto.KPIId, cancellationToken);

        if (duplicate != null)
            throw new ConflictException("KPI Assignment with the same KPI and Delivery Unit already exists.");

        kpiAssignment.DeliveryUnitId = dto?.DeliveryUnitId ?? kpiAssignment.DeliveryUnitId;
        kpiAssignment.KPIId = dto?.KPIId ?? kpiAssignment.KPIId;

        _unitOfWork.KPIAssignmentRepository.Update(kpiAssignment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.KPIAssignment>.Success(kpiAssignment, "KPI Assignment updated successfully.");
    }
}