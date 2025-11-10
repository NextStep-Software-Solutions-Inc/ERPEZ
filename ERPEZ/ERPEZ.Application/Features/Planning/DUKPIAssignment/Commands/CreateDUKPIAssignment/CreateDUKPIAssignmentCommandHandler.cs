using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentDto>>
{
    public async Task<ApiResponse<DUKPIAssignmentDto>> Handle(CreateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        if (request.DeliveryUnitId == Guid.Empty || request.KPIId == Guid.Empty)
        {
            return new ApiResponse<DUKPIAssignmentDto>
            {
                Message = "KPI and Delivery Unit are required.",
                Succeeded = false
            };
        }
        var deliveryUnit = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.DeliveryUnitId == request.DeliveryUnitId,
            cancellationToken: cancellationToken
        );

        if (deliveryUnit != null)
            throw new ConflictException("KPIAssigment already exists.");

        if (request.KPIId != Guid.Empty)
        {
            await _unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");
        }

        if (request.DeliveryUnitId != Guid.Empty)
        {
            await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Delivery Unit not found.");
        }

        var kpiAssignment = new Domain.Entities.Planning.DUKPIAssignment
        {
            KPIId = request.KPIId,
            DeliveryUnitId = request.DeliveryUnitId,
            KPITargetId = request.KPITargetId,
            AllocatedTargetValue = request.AllocatedTargetValue,
        };

        await _unitOfWork.DUKPIAssignmentRepository.AddAsync(kpiAssignment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var res = new DUKPIAssignmentDto
        {
            Id = kpiAssignment.Id,
            KPIId = kpiAssignment.KPIId,
            DeliveryUnitId = kpiAssignment.DeliveryUnitId,
            KPITargetId = kpiAssignment.KPITargetId,
            AllocatedTargetValue = kpiAssignment.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentDto>.Success(res, "DU KPI Assignment created successfully.");
    }
}