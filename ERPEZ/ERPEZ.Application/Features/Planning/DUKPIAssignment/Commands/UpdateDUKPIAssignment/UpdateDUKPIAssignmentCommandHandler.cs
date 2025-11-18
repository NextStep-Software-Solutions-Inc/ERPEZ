using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateDUKPIAssignmentCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateDUKPIAssignmentCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateDUKPIAssignment;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var dukpi = await unitOfWork.DUKPIAssignmentRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("DU KPI Assignment not found.");

            var kpi = await unitOfWork.KPIRepository.GetByIdAsync(dukpi.KPIId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI not found.");

            var duplicate = await unitOfWork.DUKPIAssignmentRepository.FindAsync(
                x => x.AllocatedTargetValue == dto.AllocatedTargetValue,
                cancellationToken
            );

            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("DU KPI Assignment already exists.");

            var kPITarget = await unitOfWork.KPITargetRepository.GetByIdAsync(dukpi.KPITargetId, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("KPI Target not found.");

            decimal allocatedValue = dto.AllocatedTargetValue;

            if (!kpi.IsTargetValueAllocable)
            {
                // Automatically set to the full KPI target value for better UX
                allocatedValue = kPITarget.TargetValue;
            }

            var existingTotalExcludingCurrent = await unitOfWork.DUKPIAssignmentRepository
                .Query(kt => kt.KPITargetId == dukpi.KPITargetId)
                .Where(t => t.Id != dukpi.Id)
                .SumAsync(target => target.AllocatedTargetValue, cancellationToken);
            var newTotalAllocatedValue = existingTotalExcludingCurrent + allocatedValue;
            if (newTotalAllocatedValue > kPITarget.TargetValue) throw new BadRequestException($"The total allocated value ({newTotalAllocatedValue}) exceeds the KPI's overall target value of [ {kPITarget.TargetValue} ]. Please reduce the allocation.");

            dukpi.AllocatedTargetValue = allocatedValue;

            unitOfWork.DUKPIAssignmentRepository.Update(dukpi);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken); return ApiResponse<Unit>.Success(Unit.Value, "DU KPI Assignment updated successfully.");
    }
}
