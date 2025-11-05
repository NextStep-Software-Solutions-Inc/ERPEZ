using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.UpdateWFPActivity;

public class UpdateWFPActivityCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateWFPActivityCommand, ApiResponse<Domain.Entities.Planning.WFPActivity>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.WFPActivity>> Handle(UpdateWFPActivityCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPActivity;

        if(dto.WFPId != null) _ = _unitOfWork.WFPRepository.FindAsync(w => w.Id == dto.WFPId, cancellationToken) ?? throw new NotFoundException("WFP Not Found.");
        if(dto.WFPOutcomeId != null) _ = _unitOfWork.WFPOutcomeRepository.FindAsync(w => w.Id == dto.WFPOutcomeId, cancellationToken) ?? throw new NotFoundException("WFP Outcome Not Found.");

        var wfpActivity = await _unitOfWork.WFPActivityRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP activity not found.");

        wfpActivity.Name = dto.Name ?? wfpActivity.Name;
        wfpActivity.WFPId = dto.WFPId ?? wfpActivity.WFPId;
        wfpActivity.WFPOutcomeId = dto.WFPOutcomeId ?? wfpActivity.WFPOutcomeId;
        wfpActivity.OutputIndicator = dto.OutputIndicator ?? wfpActivity.OutputIndicator;
        wfpActivity.Deliverable = dto.Deliverable ?? wfpActivity.Deliverable;
        wfpActivity.Timeframe = dto.Timeframe ?? wfpActivity.Timeframe;
        wfpActivity.PersonsInvolved = dto.PersonsInvolved ?? wfpActivity.PersonsInvolved;

        _unitOfWork.WFPActivityRepository.Update(wfpActivity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.WFPActivity>.Success(wfpActivity, "WFP activity updated successfully.");
    }
}
