using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

public class DeleteWFPObjectiveTimelineCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWFPObjectiveTimelineCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWFPObjectiveTimelineCommand request, CancellationToken cancellationToken)
    {
        var wfpObjectiveTimeline = await unitOfWork.WFPObjectiveTimelineRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("WFP Objective Timeline not found.");

        unitOfWork.WFPObjectiveTimelineRepository.Remove(wfpObjectiveTimeline);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"WFP Objective Timeline with ID {request.Id} deleted successfully.");
    }
}
