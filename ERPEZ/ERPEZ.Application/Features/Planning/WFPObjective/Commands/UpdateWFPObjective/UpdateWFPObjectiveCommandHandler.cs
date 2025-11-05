using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateWFPObjectiveCommand, ApiResponse<Domain.Entities.Planning.WFPObjective>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPObjective>> Handle(UpdateWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjective;

        if(dto.WFPId != null)
        {
            _ = await _unitOfWork.WFPRepository.FindAsync(w => w.Id == dto.WFPId, cancellationToken) ?? throw new NotFoundException("WFP not found.");
        }
        var wfpObjective = await _unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective not found.");

        var duplicate = await _unitOfWork.WFPObjectiveRepository.FindAsync(
            x => x.WFPId == dto.WFPId && x.Description == dto.Description,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("WFP Objective already exists.");
        
        wfpObjective.Description = dto.Description ?? wfpObjective.Description;
        wfpObjective.WFPId = dto.WFPId ?? wfpObjective.WFPId;

        _unitOfWork.WFPObjectiveRepository.Update(wfpObjective);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFPObjective>.Success(wfpObjective, "WFP Objective updated successfully.");
    }
}
