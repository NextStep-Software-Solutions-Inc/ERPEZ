using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.ChangeAPRStatus;

public class ChangeAPRStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeAPRStatusCommand, ApiResponse<Guid>>
{
    // Allowed target statuses per current status
    private static readonly Dictionary<StatusEnum, StatusEnum[]> allowedTransitions = new()
    {
        [StatusEnum.ForApproval] = new[] { StatusEnum.Approved, StatusEnum.Returned },
        [StatusEnum.Returned] = new[] { StatusEnum.Draft }
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

        if (request.Status == StatusEnum.Approved)
            apr.ApprovedDate = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Remarks))
            apr.AdditionalRemarks = request.Remarks;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(apr.Id, $"APR status changed to {request.Status}.");
    }
}
