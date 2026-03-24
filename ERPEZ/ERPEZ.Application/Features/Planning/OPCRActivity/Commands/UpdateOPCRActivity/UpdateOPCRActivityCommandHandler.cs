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

        if (request.UpdateOPCRActivity.PAPDepartmentIds != null)
        {
            if (request.UpdateOPCRActivity.PAPDepartmentIds.Any())
            {
                var offices = await unitOfWork.OfficeRepository.ToListAsync(
                    unitOfWork.OfficeRepository.Query(o => request.UpdateOPCRActivity.PAPDepartmentIds.Contains(o.Id)),
                    cancellationToken);

                if (offices.Count != request.UpdateOPCRActivity.PAPDepartmentIds.Count)
                {
                    throw new BadRequestException("One or more Offices not found.");
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

            var newDepartments = request.UpdateOPCRActivity.PAPDepartmentIds.Select(officeId => new Domain.Entities.Planning.OPCRPAPDepartment
            {
                OPCRActivityId = opcrActivity.Id,
                OfficeId = officeId
            }).ToList();

            await unitOfWork.OPCRPAPDepartmentRepository.AddRangeAsync(newDepartments, cancellationToken);
        }

        opcrActivity.Name = dto.Name ?? opcrActivity.Name;
        opcrActivity.Description = dto.Description ?? opcrActivity.Description;
        opcrActivity.Budget = dto.Budget ?? opcrActivity.Budget;

        unitOfWork.OPCRActivityRepository.Update(opcrActivity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity updated successfully.");
    }
}
