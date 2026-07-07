using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.LinkCeilingToLIB;

public class LinkCeilingToLIBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LinkCeilingToLIBCommand, ApiResponse<Unit>>
{
    private static readonly HashSet<string> allowedStatuses =
        new(StringComparer.OrdinalIgnoreCase) { "Proposed", "PendingCeilingApproval" };

    public async Task<ApiResponse<Unit>> Handle(LinkCeilingToLIBCommand command, CancellationToken cancellationToken)
    {
        // 1. Load the LIB.
        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(command.LIBId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.LIBId} not found.");

        // 2. Only Proposed or PendingCeilingApproval LIBs can be linked to a ceiling.
        if (!allowedStatuses.Contains(lib.Status))
        {
            throw new ValidationException(
                $"Only LIBs with status 'Proposed' or 'PendingCeilingApproval' can be linked to a ceiling. " +
                $"Current status: '{lib.Status}'.");
        }

        // 3. Validate the AgencyMasterBudget exists.
        var agencyMasterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(
                command.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {command.AgencyMasterBudgetId} not found.");

        // 4. Ensure the AgencyMasterBudget's FundSource matches the LIB's FundSource.
        if (agencyMasterBudget.FundSourceId != lib.FundSourceId)
        {
            throw new ValidationException(
                "The FundSource of the provided AgencyMasterBudget does not match the FundSource of the LIB.");
        }

        // 5. Link the ceiling and promote the LIB to Draft.
        lib.AgencyMasterBudgetId = command.AgencyMasterBudgetId;
        lib.Status = "Draft";

        unitOfWork.LineItemBudgetRepository.Update(lib);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Ceiling linked to LIB successfully. Status set to Draft.");
    }
}
