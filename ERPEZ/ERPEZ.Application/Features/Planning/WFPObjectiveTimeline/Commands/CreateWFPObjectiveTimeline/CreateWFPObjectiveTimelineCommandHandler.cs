using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;

public class CreateWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPObjectiveTimelineCommand, ApiResponse<WFPObjectiveTimelineResponse>>
{
    public async Task<ApiResponse<WFPObjectiveTimelineResponse>> Handle(CreateWFPObjectiveTimelineCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.WFPObjectiveTargetRepository.GetByIdAsync(request.WFPObjectiveTargetId, cancellationToken) ??
            throw new NotFoundException("WFP Objective Target should exist.");

        var duplicate = await unitOfWork.WFPObjectiveTimelineRepository.FindAsync(w =>
        w.WFPObjectiveTargetId == request.WFPObjectiveTargetId &&
        w.StartDate == request.StartDate &&
        w.EndDate == request.EndDate, cancellationToken);
        if (duplicate != null) throw new ConflictException("WFP Objective Timeline already exists.");

        var wfpObjectiveTimeline = new Domain.Entities.Planning.WFPObjectiveTimeline
        {
            WFPObjectiveTargetId = request.WFPObjectiveTargetId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TargetValue = request.TargetValue
        };

        await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(wfpObjectiveTimeline, cancellationToken);
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
        return ApiResponse<WFPObjectiveTimelineResponse>.Success(result, "WFP Objective Timeline created successfully.");
    }
}
