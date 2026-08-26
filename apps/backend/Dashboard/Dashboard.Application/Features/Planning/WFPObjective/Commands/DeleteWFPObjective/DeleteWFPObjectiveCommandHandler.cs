using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

public class DeleteWFPObjectiveCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveCommand request, CancellationToken cancellationToken)
    {
        var wfpObjective = await unitOfWork.WFPObjectiveRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("WFP Objective not found.");

        // Load linked activities to delete them and their child entities cleanly
        var activities = await unitOfWork.WFPObjectiveActivityRepository.ToListAsync(
            unitOfWork.WFPObjectiveActivityRepository.Query(a => a.WFPObjectiveId == request.Id),
            cancellationToken);

        if (activities.Any())
        {
            var activityIds = activities.Select(a => a.Id).ToList();

            var timelines = await unitOfWork.WFPObjectiveTimelineRepository.ToListAsync(
                unitOfWork.WFPObjectiveTimelineRepository.Query(t => activityIds.Contains(t.WFPObjectiveActivityId)),
                cancellationToken);

            var expenditures = await unitOfWork.WFPObjectiveActivityExpenditureRepository.ToListAsync(
                unitOfWork.WFPObjectiveActivityExpenditureRepository.Query(e => activityIds.Contains(e.WFPObjectiveActivityId)),
                cancellationToken);

            unitOfWork.WFPObjectiveTimelineRepository.RemoveRange(timelines);
            unitOfWork.WFPObjectiveActivityExpenditureRepository.RemoveRange(expenditures);
            unitOfWork.WFPObjectiveActivityRepository.RemoveRange(activities);
        }

        unitOfWork.WFPObjectiveRepository.Remove(wfpObjective);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective with ID {request.Id} deleted successfully.");
    }
}
