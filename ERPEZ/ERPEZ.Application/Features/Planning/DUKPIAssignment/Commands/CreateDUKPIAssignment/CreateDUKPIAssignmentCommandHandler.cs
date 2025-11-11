using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentDto>>
{
    public async Task<ApiResponse<DUKPIAssignmentDto>> Handle(CreateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dukpi = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
            t => t.KPIId == request.KPIId && t.DeliveryUnitId == request.DeliveryUnitId,
            cancellationToken: cancellationToken
        );

        if (dukpi != null)
            throw new ConflictException("DU KPI Assignment already exists for this Delivery Unit.");

        _ = await _unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI not found.");

        _ = await _unitOfWork.DeliveryUnitRepository.GetByIdAsync(request.DeliveryUnitId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Delivery Unit not found.");

        var kPITarget = await _unitOfWork.KPITargetRepository.GetByIdAsync(request.KPITargetId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target not found.");

        var existingAllocationsQuery = _unitOfWork.DUKPIAssignmentRepository.Query(
            t => t.KPITargetId == request.KPITargetId
        );

        var totalPreviouslyAllocated = await existingAllocationsQuery
            .SumAsync(target => target.AllocatedTargetValue, cancellationToken);

        var newTotalAllocatedValue = totalPreviouslyAllocated + request.AllocatedTargetValue;

        if (kPITarget.TargetValue < newTotalAllocatedValue) throw new BadRequestException(
                $"The requested allocation ({request.AllocatedTargetValue}) causes the total allocated value to exceed the KPI's overall target value of [ {kPITarget.TargetValue} ]. Current total allocated: {totalPreviouslyAllocated}."
            );

        var duKpiAssignment = new Domain.Entities.Planning.DUKPIAssignment
        {
            KPIId = request.KPIId,
            DeliveryUnitId = request.DeliveryUnitId,
            KPITargetId = request.KPITargetId,
            AllocatedTargetValue = request.AllocatedTargetValue,
        };

        await _unitOfWork.DUKPIAssignmentRepository.AddAsync(duKpiAssignment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var res = new DUKPIAssignmentDto
        {
            Id = duKpiAssignment.Id,
            KPIId = duKpiAssignment.KPIId,
            DeliveryUnitId = duKpiAssignment.DeliveryUnitId,
            KPITargetId = duKpiAssignment.KPITargetId,
            AllocatedTargetValue = duKpiAssignment.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentDto>.Success(res, "DU KPI Assignment created successfully.");
    }
}