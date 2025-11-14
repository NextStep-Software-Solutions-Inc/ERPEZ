using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<DUKPIAssignmentResponse>>
{
    public async Task<ApiResponse<DUKPIAssignmentResponse>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
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

        var kPITarget = await unitOfWork.KPITargetRepository.GetByIdAsync(dukpi.KPITargetId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Target not found.");

        var existingTotalExcludingCurrent = await unitOfWork.DUKPIAssignmentRepository
            .Query(kt => kt.KPITargetId == dukpi.KPITargetId)
            .Where(t => t.Id != dukpi.Id)
            .SumAsync(target => target.AllocatedTargetValue, cancellationToken);
        var newTotalAllocatedValue = existingTotalExcludingCurrent + dto.AllocatedTargetValue;
        if (newTotalAllocatedValue > kPITarget.TargetValue) throw new BadRequestException($"The total allocated value ({newTotalAllocatedValue}) exceeds the KPI's overall target value of [ {kPITarget.TargetValue} ]. Please reduce the allocation.");
        
        dukpi.AllocatedTargetValue = dto.AllocatedTargetValue;

        unitOfWork.DUKPIAssignmentRepository.Update(dukpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new DUKPIAssignmentResponse
        {
            Id = dukpi.Id,
            DeliveryUnitId = dukpi.DeliveryUnitId,
            KPITargetId = dukpi.KPITargetId,
            AllocatedTargetValue = dto.AllocatedTargetValue
        };
        return ApiResponse<DUKPIAssignmentResponse>.Success(result, "DU KPI Assignment updated successfully.");
    }
}
