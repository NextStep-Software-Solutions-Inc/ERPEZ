using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateOPCRActivityCommand, ApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRActivity>> Handle(UpdateOPCRActivityCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOPCRActivity;
        if(dto.OPCRKPIId != null)
        {
            var opcrKPI = await _unitOfWork.OPCRKPIRepository.FindAsync(
                x => x.Id == dto.OPCRKPIId,
                cancellationToken: cancellationToken
            ) ?? throw new NotFoundException("OPCR KPI not found.");

        }
        var opcrActivity = await _unitOfWork.OPCRActivityRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("OPCR Activity not found.");
        
        opcrActivity.Name = dto.Name ?? opcrActivity.Name;
        opcrActivity.Description = dto.Description ?? opcrActivity.Description;
        opcrActivity.OPCRKPIId = dto.OPCRKPIId ?? opcrActivity.OPCRKPIId;
        opcrActivity.Budget = dto.Budget ?? opcrActivity.Budget;

        _unitOfWork.OPCRActivityRepository.Update(opcrActivity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.OPCRActivity>.Success(opcrActivity, "OPCR Activity updated successfully.");
    }
}
