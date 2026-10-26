using ERPEZ.Application.Common.Helpers;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;

public class ChangeAPRStatusCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService? currentUser = null)
    : IRequestHandler<ChangeAPRStatusCommand, ApiResponse<Guid>>
{
    // Allowed target statuses per current status
    private static readonly Dictionary<StatusEnum, StatusEnum[]> allowedTransitions = new()
    {
        [StatusEnum.ForApproval] = new[] { StatusEnum.Approved, StatusEnum.Returned },
        [StatusEnum.Returned] = new[] { StatusEnum.Draft, StatusEnum.ForApproval },
        [StatusEnum.Draft] = new[] { StatusEnum.ForApproval }
    };

    public async Task<ApiResponse<Guid>> Handle(ChangeAPRStatusCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetByIdAsync(request.Id, cancellationToken);
        if (apr is null)
            return ApiResponse<Guid>.Fail("APR not found.");

        if (!allowedTransitions.TryGetValue(apr.Status, out var allowed) || !allowed.Contains(request.Status))
            return ApiResponse<Guid>.Fail(
                $"Cannot change APR status from {apr.Status} to {request.Status}.");

        apr.Status = request.Status;

        string? actorName = null;
        if (!string.IsNullOrWhiteSpace(currentUser?.ExternalIdentityId) && unitOfWork.UserRepository != null)
        {
            var user = await unitOfWork.UserRepository.GetByExternalIdentityIdAsync(currentUser.ExternalIdentityId, cancellationToken);
            actorName = user?.FullName;
        }

        if (string.IsNullOrWhiteSpace(actorName) && apr.OfficeId != Guid.Empty)
        {
            var wf = await DocumentSignatoryResolver.ResolveWorkflowApproversAsync(
                unitOfWork, apr.OfficeId, apr.FiscalYearId, "APR", cancellationToken);
            actorName = wf.FinalApprover?.FullName;
        }

        if (request.Status == StatusEnum.Approved)
        {
            apr.ApprovedDate = DateTime.UtcNow;
            apr.ApprovedBy = !string.IsNullOrWhiteSpace(actorName) ? actorName : "Procurement Officer";
        }
        else if (request.Status == StatusEnum.Returned)
        {
            apr.ReturnedDate = DateTime.UtcNow;
            apr.ReturnedBy = !string.IsNullOrWhiteSpace(actorName) ? actorName : "Procurement Officer";
            if (!string.IsNullOrWhiteSpace(request.Remarks))
            {
                apr.ReturnRemarks = request.Remarks;
            }
        }
        else if (request.Status == StatusEnum.ForApproval)
        {
            apr.SubmittedDate = DateTime.UtcNow;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(apr.Id, $"APR status changed to {request.Status}.");
    }
}
