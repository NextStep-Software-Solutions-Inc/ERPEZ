using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

public class UpdateWFPObjectiveTargetCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveTargetCommand, ApiResponse<WFPObjectiveTargetResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTargetResponse>> Handle(UpdateWFPObjectiveTargetCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTarget;
        var wfpObjectiveTarget = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective Target not found.");

        var duplicate = await unitOfWork.WFPObjectiveTargetRepository.FindAsync(
            x => x.Id != request.Id &&
            x.WFPObjectiveId != wfpObjectiveTarget.WFPObjectiveId &&
            x.ActivityName == dto.ActivityName &&
            x.Indicator == dto.Indicator,
            cancellationToken
        );
        if (duplicate != null)
            throw new ConflictException("WFP Objective Target already exists.");

        wfpObjectiveTarget.ActivityName = dto.ActivityName ?? wfpObjectiveTarget.ActivityName;
        wfpObjectiveTarget.Indicator = dto.Indicator ?? wfpObjectiveTarget.Indicator;
        wfpObjectiveTarget.Weight = dto.Weight ?? wfpObjectiveTarget.Weight;

        unitOfWork.WFPObjectiveTargetRepository.Update(wfpObjectiveTarget);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new WFPObjectiveTargetResponse()
        {
            Id = wfpObjectiveTarget.Id,
            WFPObjectiveId = wfpObjectiveTarget.WFPObjectiveId,
            ActivityName = wfpObjectiveTarget.ActivityName,
            Indicator = wfpObjectiveTarget.Indicator,
            Weight = wfpObjectiveTarget.Weight,
            CreatedAt = wfpObjectiveTarget.CreatedAt,
            CreatedBy = wfpObjectiveTarget.CreatedBy
        };

        return ApiResponse<WFPObjectiveTargetResponse>.Success(result, "WFP Objective Target updated successfully.");
    }
}
