using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public class UpdatePRStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePRStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePRStatusCommand command, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {command.Id} not found.");

        if (pr.Status == ERPEZ.Domain.Enums.StatusEnum.Approved && command.Status != ERPEZ.Domain.Enums.StatusEnum.Approved)
            throw new ValidationException($"Cannot change status of an Approved Purchase Request to '{command.Status}'.");

        if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Approved && pr.Status != ERPEZ.Domain.Enums.StatusEnum.Submitted)
            throw new ValidationException($"Cannot approve Purchase Request in '{pr.Status}' status. Only Submitted Purchase Requests can be approved.");

        if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Returned && pr.Status != ERPEZ.Domain.Enums.StatusEnum.Submitted)
            throw new ValidationException($"Cannot return Purchase Request in '{pr.Status}' status. Only Submitted Purchase Requests can be returned.");

        if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Submitted &&
            pr.Status != ERPEZ.Domain.Enums.StatusEnum.Draft &&
            pr.Status != ERPEZ.Domain.Enums.StatusEnum.Returned)
            throw new ValidationException($"Cannot submit Purchase Request in '{pr.Status}' status.");

        pr.Status = command.Status;

        if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Returned)
        {
            pr.ReturnRemarks = string.IsNullOrWhiteSpace(command.Remarks) ? null : command.Remarks.Trim();
            pr.ReturnedDate = DateTime.UtcNow;
            pr.ReturnedBy = string.IsNullOrWhiteSpace(command.ActorName) ? null : command.ActorName.Trim();
            pr.ApprovedDate = null;
        }
        else if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Approved)
        {
            pr.ApprovedDate = DateTime.UtcNow;
            pr.ReturnRemarks = null;
            pr.ReturnedDate = null;
            pr.ReturnedBy = null;
        }
        else if (command.Status == ERPEZ.Domain.Enums.StatusEnum.Submitted)
        {
            pr.SubmittedDate = DateTime.UtcNow;
            pr.ReturnRemarks = null;
            pr.ReturnedDate = null;
            pr.ReturnedBy = null;
            pr.ApprovedDate = null;
        }

        unitOfWork.PurchaseRequestRepository.Update(pr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request status updated successfully.");
    }
}