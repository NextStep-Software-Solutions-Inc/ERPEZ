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

        // 2. A LIB can only ever be linked to an AgencyMasterBudget once.
        //    Once set, that budget is permanent — no re-linking or swapping.
        if (lib.AgencyMasterBudgetId.HasValue)
        {
            throw new ValidationException(
                $"LIB {lib.Id} is already linked to Agency Master Budget {lib.AgencyMasterBudgetId}. " +
                "Re-linking is not allowed.");
        }

        // 3. Only Proposed or PendingCeilingApproval LIBs can be linked to a ceiling.
        if (!allowedStatuses.Contains(lib.Status))
        {
            throw new ValidationException(
                $"Only LIBs with status 'Proposed' or 'PendingCeilingApproval' can be linked to a ceiling. " +
                $"Current status: '{lib.Status}'.");
        }

        // 4. Validate the AgencyMasterBudget exists.
        var agencyMasterBudget = await unitOfWork.AgencyMasterBudgetRepository.GetByIdAsync(
                command.AgencyMasterBudgetId, cancellationToken)
            ?? throw new NotFoundException($"Agency Master Budget with ID {command.AgencyMasterBudgetId} not found.");

        // 5. Ensure the AgencyMasterBudget's FundSource matches the LIB's FundSource.
        if (agencyMasterBudget.FundSourceId != lib.FundSourceId)
        {
            throw new ValidationException(
                "The FundSource of the provided AgencyMasterBudget does not match the FundSource of the LIB.");
        }

        // 6. Ensure the AgencyMasterBudget's FiscalYear matches the LIB's FiscalYear.
        //    A LIB with no FiscalYearId (multi-year WFP) cannot be linked to a
        //    single-year AgencyMasterBudget, since there's no year to match against.
        if (lib.FiscalYearId is null || agencyMasterBudget.FiscalYearId != lib.FiscalYearId)
        {
            throw new ValidationException(
                "The Agency Master Budget's Fiscal Year does not match the LIB's Fiscal Year.");
        }

        // 7. Ensure an OfficeCeiling exists for this LIB's office under this AgencyMasterBudget.
        var officeCeiling = await unitOfWork.OfficeCeilingRepository.FindAsync(
            oc => oc.OfficeId == lib.OfficeId && oc.AgencyMasterBudgetId == agencyMasterBudget.Id,
            cancellationToken);

        if (officeCeiling is null)
        {
            throw new NotFoundException(
                $"No Office Ceiling exists for Office {lib.OfficeId} under this Agency Master Budget.");
        }

        // 8. Link the ceiling and promote the LIB to Draft.
        lib.AgencyMasterBudgetId = command.AgencyMasterBudgetId;
        lib.Status = "Draft";

        unitOfWork.LineItemBudgetRepository.Update(lib);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Ceiling linked to LIB successfully. Status set to Draft.");
    }
}