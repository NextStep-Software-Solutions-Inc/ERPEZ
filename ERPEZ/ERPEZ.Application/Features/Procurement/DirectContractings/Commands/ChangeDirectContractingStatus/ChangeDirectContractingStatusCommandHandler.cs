using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ChangeDirectContractingStatus;

public class ChangeDirectContractingStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeDirectContractingStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ChangeDirectContractingStatusCommand command, CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.GetByIdAsync(command.Id, cancellationToken);
        if (dc == null)
        {
            return ApiResponse<Unit>.Fail("Direct Contracting request not found.");
        }
        if (!Enum.IsDefined(typeof(DirectContractingStatusEnum), command.Status))                                                                              
            {                                                                                                                                                                         
                return ApiResponse<Unit>.Fail("The provided status value is invalid and does not match the expected status enum values. Ex: DRAFT, DRAFT, FOR_REVIEW, SUBMITTED_TO_SUPPLIER, PENDING_FOR_APPROVAL, APPROVED, RETURNED");                                            
            }  
        var oldStatus = dc.Status;
        dc.Status = command.Status;

        unitOfWork.DirectContractingRepository.Update(dc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Direct Contracting status updated from {oldStatus} to {command.Status} successfully.");
    }
}
