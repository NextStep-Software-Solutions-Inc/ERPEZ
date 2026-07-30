using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class SubmitConsolidatedPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitConsolidatedPRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitConsolidatedPRCommand command, CancellationToken cancellationToken)
    {
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetCPRWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Consolidated PR with ID {command.Id} not found.");

        if (cpr.Status != StatusEnum.Draft)
            throw new ValidationException("Only Draft Consolidated PRs can be submitted.");

        if (cpr.ConsolidatedPRItems.Count == 0)
            throw new ValidationException("Cannot submit a Consolidated PR with no items.");

        var missingMOP = cpr.ConsolidatedPRItems
            .Where(ci => ci.ProcurementModeId is null)
            .Select(ci => ci.PRItem.Name)
            .ToList();

        if (missingMOP.Count > 0)
            throw new ValidationException($"Missing Mode of Procurement for: {string.Join(", ", missingMOP)}.");

        cpr.Status       = StatusEnum.Submitted;

        unitOfWork.ConsolidatedPRRepository.Update(cpr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR submitted for BAC Utilization.");
    }
}