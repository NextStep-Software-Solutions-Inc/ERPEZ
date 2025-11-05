using ERPEZ.Application.Features.Planning.WFPActivity.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Commands.CreateWFPActivity;

public class CreateWFPActivityCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<CreateWFPActivityCommand, ApiResponse<WFPActivityDto>>
{
    public async Task<ApiResponse<WFPActivityDto>> Handle(CreateWFPActivityCommand request, CancellationToken cancellationToken)
    {
        _ = _unitOfWork.WFPRepository.GetByIdAsync(request.WFPId, cancellationToken) ?? throw new NotFoundException("WFP not found.");
        _ = _unitOfWork.WFPOutcomeRepository.GetByIdAsync(request.WFPOutcomeId, cancellationToken) ?? throw new NotFoundException("WFP Outcome not found.");
        
        var wfpActivity = new Domain.Entities.Planning.WFPActivity
        {
            WFPId = request.WFPId,
            WFPOutcomeId = request.WFPOutcomeId,
            Name = request.Name,
            OutputIndicator = request.OutputIndicator,
            Deliverable = request.Deliverable,
            Timeframe = request.Timeframe,
            PersonsInvolved = request.PersonsInvolved
        };

        await _unitOfWork.WFPActivityRepository.AddAsync(wfpActivity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new WFPActivityDto
        {
            WFPId = wfpActivity.WFPId,
            WFPOutcomeId = wfpActivity.WFPOutcomeId,
            Name = wfpActivity.Name,
            OutputIndicator = wfpActivity.OutputIndicator,
            Deliverable= wfpActivity.Deliverable,
            Timeframe = wfpActivity.Timeframe,
            PersonsInvolved= wfpActivity.PersonsInvolved
        };
        return ApiResponse<WFPActivityDto>.Success(dto, "WFP Activity created successfully.");
    }
}
