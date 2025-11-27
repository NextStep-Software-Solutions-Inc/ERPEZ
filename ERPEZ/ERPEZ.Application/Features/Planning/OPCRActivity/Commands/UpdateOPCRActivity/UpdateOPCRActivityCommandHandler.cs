using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOPCRActivityCommand, ApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRActivity>> Handle(UpdateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRActivity;
        if (dto.OPCRId.HasValue)
        {
            _ = await unitOfWork.OPCRRepository.FindAsync(o => o.Id == dto.OPCRId.Value, cancellationToken) ?? throw new NotFoundException("OPCR not found.");
        }
        if (dto.DUKPIAssignmentId.HasValue)
        {
            _ = await unitOfWork.DUKPIAssignmentRepository.FindAsync(d => d.Id == dto.DUKPIAssignmentId.Value, cancellationToken) ?? throw new NotFoundException("DU KPI Assignment not found.");
        }
        var opcrActivity = await unitOfWork.OPCRActivityRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");

        opcrActivity.Name = dto.Name ?? opcrActivity.Name;
        opcrActivity.Description = dto.Description ?? opcrActivity.Description;
        opcrActivity.OPCRId = dto.OPCRId ?? opcrActivity.OPCRId;
        opcrActivity.DUKPIAssignmentId = dto.DUKPIAssignmentId ?? opcrActivity.DUKPIAssignmentId;
        opcrActivity.Budget = dto.Budget ?? opcrActivity.Budget;

        unitOfWork.OPCRActivityRepository.Update(opcrActivity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.OPCRActivity>.Success(opcrActivity, "OPCR Activity updated successfully.");
    }
}
