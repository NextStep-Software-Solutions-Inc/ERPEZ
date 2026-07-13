// ApproveConsolidatedPRCommandHandler.cs
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class ApproveConsolidatedPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ApproveConsolidatedPRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        ApproveConsolidatedPRCommand command, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(
            command.Id, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR with ID {command.Id} not found.");

        if (cpr.Status != StatusEnum.Submitted)
            throw new ValidationException("Only Submitted Consolidated PRs can be approved.");

        cpr.Status       = StatusEnum.Approved;
        cpr.ApprovedDate = DateTime.UtcNow;

        unitOfWork.ConsolidatedPRRepository.Update(cpr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR approved successfully.");
    }
}