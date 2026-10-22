using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ChangeDirectContractingStatus;

public class ChangeDirectContractingStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeDirectContractingStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ChangeDirectContractingStatusCommand command, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .Include(x => x.BACProject)
                .ThenInclude(p => p.BACResolutions)
            .FirstOrDefaultAsync(x => x.Id == command.Id && !x.IsDeleted, cancellationToken);
        if (dc == null)
        {
            return ApiResponse<Unit>.Fail("Direct Contracting request not found.");
        }
        if (!Enum.IsDefined(typeof(DirectContractingStatusEnum), command.Status))
        {
            return ApiResponse<Unit>.Fail("The provided status value is invalid.");
        }

        var oldStatus = dc.Status;

        if (oldStatus == command.Status)
        {
            return ApiResponse<Unit>.Success(Unit.Value, $"Direct Contracting status is already '{command.Status}'.");
        }

        if (command.Status == DirectContractingStatusEnum.DRAFT &&
            oldStatus != DirectContractingStatusEnum.FOR_REVIEW &&
            oldStatus != DirectContractingStatusEnum.RETURNED)
        {
            return ApiResponse<Unit>.Fail($"Direct Contracting request can only be reverted to Draft when in 'For Review' or 'Returned' status. Current status is '{oldStatus}'.");
        }

        if (!IsValidTransition(oldStatus, command.Status))
        {
            return ApiResponse<Unit>.Fail($"Cannot transition Direct Contracting request from status '{oldStatus}' to '{command.Status}'.");
        }

        if (command.Status == DirectContractingStatusEnum.FOR_REVIEW ||
            command.Status == DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER)
        {
            var activeResolutions = dc.BACProject?.BACResolutions
                .Where(r => !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .ToList() ?? [];

            var hasApprovedResolution = activeResolutions.Any(r =>
                string.Equals(r.Status, "Approved", StringComparison.OrdinalIgnoreCase));
            var isProjectApproved = string.Equals(dc.BACProject?.Status, "Approved", StringComparison.OrdinalIgnoreCase);

            if (!hasApprovedResolution && !isProjectApproved)
            {
                var effectiveBacStatus = activeResolutions.FirstOrDefault()?.Status
                    ?? (!string.IsNullOrWhiteSpace(dc.BACProject?.Status) ? dc.BACProject.Status : "Unapproved");

                var actionLabel = command.Status == DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER
                    ? "sent to the supplier"
                    : "submitted for review";

                return ApiResponse<Unit>.Fail(
                    $"Direct Contracting request cannot be {actionLabel} until the linked BAC Resolution is Approved (current BAC status: {effectiveBacStatus}).");
            }
        }

        dc.Status = command.Status;

        unitOfWork.DirectContractingRepository.Update(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Direct Contracting status updated from {oldStatus} to {command.Status} successfully.");
    }

    // State Transitions:
    // •  DRAFT  ➔  FOR_REVIEW                                                                                                                                                      
    // •  FOR_REVIEW  ➔  SUBMITTED_TO_SUPPLIER  or  RETURNED                                                                                                                        
    // •  SUBMITTED_TO_SUPPLIER  ➔  PENDING_FOR_APPROVAL                                                                                                                            
    // •  PENDING_FOR_APPROVAL  ➔  APPROVED  or  RETURNED                                                                                                                           
    // •  RETURNED  ➔  DRAFT  or  FOR_REVIEW    
    // Note: While APPROVED is a valid transition target from PENDING_FOR_APPROVAL,
    // it should only be reached via the dedicated /approve endpoint (which handles approvals with distinct payloads),
    // and not via the general /status endpoint.
    private static bool IsValidTransition(DirectContractingStatusEnum currentStatus, DirectContractingStatusEnum newStatus)
    {
        if (currentStatus == newStatus)
            return true;

        return (currentStatus, newStatus) switch
        {
            (DirectContractingStatusEnum.DRAFT, DirectContractingStatusEnum.FOR_REVIEW) => true,
            (DirectContractingStatusEnum.FOR_REVIEW, DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER) => true,
            (DirectContractingStatusEnum.FOR_REVIEW, DirectContractingStatusEnum.RETURNED) => true,
            (DirectContractingStatusEnum.FOR_REVIEW, DirectContractingStatusEnum.DRAFT) => true,
            (DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER, DirectContractingStatusEnum.PENDING_FOR_APPROVAL) => true,
            (DirectContractingStatusEnum.PENDING_FOR_APPROVAL, DirectContractingStatusEnum.APPROVED) => true,
            (DirectContractingStatusEnum.PENDING_FOR_APPROVAL, DirectContractingStatusEnum.RETURNED) => true,
            (DirectContractingStatusEnum.RETURNED, DirectContractingStatusEnum.DRAFT) => true,
            (DirectContractingStatusEnum.RETURNED, DirectContractingStatusEnum.FOR_REVIEW) => true,
            _ => false
        };
    }
}
