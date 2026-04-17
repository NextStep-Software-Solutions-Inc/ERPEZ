using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public class ApprovePPMPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ApprovePPMPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApprovePPMPCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("PPMP not found.");

            // Only allow approval of Submitted status
           if (ppmp.Status != ERPEZ.Domain.Enums.StatusEnum.Submitted)
                throw new ValidationException($"Cannot approve PPMP in {ppmp.Status} status.");

            // Update status
            ppmp.Status = ERPEZ.Domain.Enums.StatusEnum.Approved;
            ppmp.ApprovedDate = DateTime.UtcNow;

            unitOfWork.PPMPRepository.Update(ppmp);

            // Create approval event
            var approvalEvent = new ApprovalEvent
            {
                PPMPId = ppmp.Id,
                Role = request.Role,
                Action = "Approved",
                ActorId = Guid.Empty,
                ActorName = request.ApprovedBy,
                Notes = request.Notes,
                Timestamp = DateTime.UtcNow
            };

            await unitOfWork.ApprovalEventRepository.AddAsync(approvalEvent, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "PPMP approved successfully.");
    }
}
