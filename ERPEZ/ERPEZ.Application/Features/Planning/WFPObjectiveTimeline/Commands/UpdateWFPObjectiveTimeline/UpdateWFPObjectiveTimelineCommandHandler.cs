using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;

public class UpdateWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateWFPObjectiveTimelineCommand, ApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineResponse>> Handle(UpdateWFPObjectiveTimelineCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateWFPObjectiveTimeline;
        var wfpObjectiveTimeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective Timeline not found.");

        var duplicate = await unitOfWork.WFPObjectiveTimelineRepository.FindAsync(
            x => x.WFPObjectiveTargetId == wfpObjectiveTimeline.Id &&
            x.StartDate == dto.StartDate &&
            x.EndDate == dto.EndDate,
            cancellationToken
        );

        if (duplicate != null && duplicate.Id != request.Id)
            throw new ConflictException("WFP Objective Timeline already exists.");

        wfpObjectiveTimeline.StartDate = dto?.StartDate ?? wfpObjectiveTimeline.StartDate;
        wfpObjectiveTimeline.EndDate = dto?.EndDate ?? wfpObjectiveTimeline.EndDate;
        wfpObjectiveTimeline.TargetValue = dto?.TargetValue ?? wfpObjectiveTimeline.TargetValue;

        unitOfWork.WFPObjectiveTimelineRepository.Update(wfpObjectiveTimeline);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var result = new WFPObjectiveTimelineResponse()
        {
            Id = wfpObjectiveTimeline.Id,
            WFPObjectiveTargetId = wfpObjectiveTimeline.WFPObjectiveTargetId,
            StartDate = wfpObjectiveTimeline.StartDate,
            EndDate = wfpObjectiveTimeline.EndDate,
            TargetValue = wfpObjectiveTimeline.TargetValue,
            CreatedAt = wfpObjectiveTimeline.CreatedAt,
            CreatedBy = wfpObjectiveTimeline.CreatedBy
        };

        return ApiResponse<WFPObjectiveTimelineResponse>.Success(result, "WFP Objective Timeline updated successfully.");
    }
}
