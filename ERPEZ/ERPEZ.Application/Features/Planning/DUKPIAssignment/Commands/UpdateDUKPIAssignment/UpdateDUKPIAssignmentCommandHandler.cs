using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentDto>>
{
    public async Task<ApiResponse<DUKPIAssignmentDto>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUKPIAssignment;
        var dukpi = await _unitOfWork.DUKPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("DU KPI Assignment not found.");

        var duplicate = await _unitOfWork.DUKPIAssignmentRepository.FindAsync(
            x => x.AllocatedTargetValue == dto.AllocatedTargetValue,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("DU KPI Assignment already exists.");

        var kPITarget = await _unitOfWork.KPITargetRepository.GetByIdAsync(dukpi.KPITargetId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target not found.");

        var existingTotalExcludingCurrent = await _unitOfWork.DUKPIAssignmentRepository
            .Query(kt => kt.KPITargetId == dukpi.KPITargetId)
            .Where(t => t.Id != dukpi.Id)
            .SumAsync(target => target.AllocatedTargetValue, cancellationToken);
        var newTotalAllocatedValue = existingTotalExcludingCurrent + dto.AllocatedTargetValue;
        if (newTotalAllocatedValue > kPITarget.TargetValue) throw new BadRequestException($"The total allocated value ({newTotalAllocatedValue}) exceeds the KPI's overall target value of [ {kPITarget.TargetValue} ]. Please reduce the allocation.");
        
        dukpi.AllocatedTargetValue = dto.AllocatedTargetValue;

        _unitOfWork.DUKPIAssignmentRepository.Update(dukpi);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new DUKPIAssignmentDto
        {
            Id = dukpi.Id,
            DeliveryUnitId = dukpi.DeliveryUnitId,
            KPITargetId = dukpi.KPITargetId,
            AllocatedTargetValue = dto.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentDto>.Success(result, "DU KPI Assignment updated successfully.");
    }
}
