using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRActivityCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRActivity;
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.Id, cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");

        var opcrId = dto.OPCRId ?? opcrActivity.OPCRId;
        var opcr = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == opcrId, cancellationToken) ?? throw new NotFoundException("OPCR not found.");

        var duKPITargetAssignmentId = dto.DUKPITargetAssignmentId ?? opcrActivity.DUKPITargetAssignmentId;
        var duKPITargetAssignment = await unitOfWork.DUKPITargetAssignmentRepository.FindAsync(d => d.Id == duKPITargetAssignmentId, cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");

        if (duKPITargetAssignment.DeliveryUnitId != opcr.DeliveryUnitId)
        {
            throw new BadRequestException("The DU KPI Assignment must belong to the same Delivery Unit as the OPCR.");
        }

        if (request.UpdateOPCRActivity.PAPDepartmentIds != null)
        {
            if (request.UpdateOPCRActivity.PAPDepartmentIds.Any())
            {
                var deliveryUnits = await unitOfWork.DeliveryUnitRepository.ToListAsync(
                    unitOfWork.DeliveryUnitRepository.Query(du => request.UpdateOPCRActivity.PAPDepartmentIds.Contains(du.Id)),
                    cancellationToken);

                if (deliveryUnits.Count != request.UpdateOPCRActivity.PAPDepartmentIds.Count)
                {
                    throw new BadRequestException("One or more Delivery Units not found.");
                }

                if (deliveryUnits.Any(du => du.ParentId != opcr.DeliveryUnitId))
                {
                    throw new BadRequestException("One or more Delivery Units are not children of the OPCR Delivery Unit.");
                }
            }

            // Update PAP Departments
            var existingDepartments = await unitOfWork.OPCRPAPDepartmentRepository.ToListAsync(
                unitOfWork.OPCRPAPDepartmentRepository.Query(p => p.OPCRActivityId == opcrActivity.Id),
                cancellationToken);

            foreach (var dept in existingDepartments)
            {
                unitOfWork.OPCRPAPDepartmentRepository.Remove(dept);
            }

            var newDepartments = request.UpdateOPCRActivity.PAPDepartmentIds.Select(duId => new Domain.Entities.Planning.OPCRPAPDepartment
            {
                OPCRActivityId = opcrActivity.Id,
                DeliveryUnitId = duId
            }).ToList();

            await unitOfWork.OPCRPAPDepartmentRepository.AddRangeAsync(newDepartments, cancellationToken);
        }

        opcrActivity.Name = dto.Name ?? opcrActivity.Name;
        opcrActivity.Description = dto.Description ?? opcrActivity.Description;
        opcrActivity.OPCRId = opcrId;
        opcrActivity.DUKPITargetAssignmentId = dto.DUKPITargetAssignmentId ?? opcrActivity.DUKPITargetAssignmentId;
        opcrActivity.Budget = dto.Budget ?? opcrActivity.Budget;

        unitOfWork.OPCRActivityRepository.Update(opcrActivity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity updated successfully.");
    }
}
