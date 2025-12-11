using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.UpdateWFPStatus;

public class UpdateWFPStatusCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateWFPStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWFPStatusCommand request, CancellationToken cancellationToken)
    {
        var wfp = await unitOfWork.WFPRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Work and Financial Plan not found.");

        // Parse string Status to StatusEnum (validation ensures this will succeed)
        var newStatusEnum = Enum.Parse<StatusEnum>(request.Status, ignoreCase: true);

        // Validate status transition rules
        ValidateStatusTransition(wfp.Status, newStatusEnum);

        wfp.Status = newStatusEnum;

        unitOfWork.WFPRepository.Update(wfp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Work and Financial Plan status updated to {request.Status} successfully.");
    }

    private static void ValidateStatusTransition(StatusEnum currentStatus, StatusEnum newStatus)
    {
        // Define valid status transitions
        var validTransitions = new Dictionary<StatusEnum, StatusEnum[]>
        {
            { StatusEnum.Draft, [StatusEnum.Submitted, StatusEnum.Archived] },
            { StatusEnum.Submitted, [StatusEnum.Approved, StatusEnum.Returned, StatusEnum.Archived] },
            { StatusEnum.Returned, [StatusEnum.Draft, StatusEnum.Submitted, StatusEnum.Archived] },
            { StatusEnum.Approved, [StatusEnum.Active, StatusEnum.Returned, StatusEnum.Archived] },
            { StatusEnum.Active, [StatusEnum.Archived] },
            { StatusEnum.Archived, [StatusEnum.Draft] }
        };

        if (currentStatus == newStatus)
            return; // No change needed

        if (!validTransitions.TryGetValue(currentStatus, out var allowedStatuses))
            throw new BadRequestException($"Status transition from {currentStatus} is not supported.");

        if (!allowedStatuses.Contains(newStatus))
            throw new BadRequestException(
                $"Cannot transition from {currentStatus} to {newStatus}. " +
                $"Valid transitions from {currentStatus}: {string.Join(", ", allowedStatuses)}.");
    }
}
