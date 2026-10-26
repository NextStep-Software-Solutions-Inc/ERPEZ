using ERPEZ.Application.Features.Planning.LineItemBudget.Validators;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.SubmitLIB;

public class SubmitLIBCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUser,
    IUserAuthorizationService authorizationService,
    ITenantContextService tenantContext)
    : IRequestHandler<SubmitLIBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SubmitLIBCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {command.Id} not found.");

        // Layer 3: Resource Scoping Guard
        if (!currentUser.IsSuperAdmin)
        {
            var hasGlobalAccess = await authorizationService.HasPermissionAsync(
                currentUser.ExternalIdentityId ?? string.Empty,
                tenantContext.TenantId,
                Permissions.Planning.viewGlobalDashboard,
                cancellationToken);

            if (!hasGlobalAccess)
            {
                if (!currentUser.OfficeId.HasValue || entity.OfficeId != currentUser.OfficeId.Value)
                {
                    throw new ForbiddenException("You cannot submit a Line Item Budget outside your assigned Office.");
                }
            }
        }

        var isSubmittableState = entity.Status.Equals(nameof(LIBStatus.Draft), StringComparison.OrdinalIgnoreCase) ||
                                 entity.Status.Equals(nameof(LIBStatus.Returned), StringComparison.OrdinalIgnoreCase) ||
                                 entity.Status.Equals(nameof(LIBStatus.Proposed), StringComparison.OrdinalIgnoreCase);

        if (!isSubmittableState)
        {
            throw new ValidationException($"Cannot submit LIB with status '{entity.Status}'. Only Draft, Returned, or Proposed LIBs can be submitted.");
        }

        var (isValid, errors, _) = LineItemBudgetValidationRules.ValidateSubmissionCompleteness(entity);
        if (!isValid)
        {
            throw new ValidationException($"Cannot submit incomplete LIB: {string.Join("; ", errors)}");
        }

        // Validate Department Ceiling
        if (entity.OfficeId.HasValue)
        {
            decimal? departmentCeiling = null;

            if (entity.AgencyMasterBudgetId.HasValue)
            {
                var ceiling = await unitOfWork.OfficeCeilingRepository.FindAsync(
                    x => x.AgencyMasterBudgetId == entity.AgencyMasterBudgetId.Value && x.OfficeId == entity.OfficeId.Value && !x.IsDeleted,
                    cancellationToken);
                if (ceiling != null)
                {
                    departmentCeiling = ceiling.PSAmount + ceiling.MOOEAmount + ceiling.COAmount;
                }
            }

            if (!departmentCeiling.HasValue && entity.FiscalYearId.HasValue)
            {
                var ceiling = await unitOfWork.OfficeCeilingRepository.FindAsync(
                    x => x.FiscalYearId == entity.FiscalYearId.Value && x.OfficeId == entity.OfficeId.Value && !x.IsDeleted,
                    cancellationToken);
                if (ceiling != null)
                {
                    departmentCeiling = ceiling.PSAmount + ceiling.MOOEAmount + ceiling.COAmount;
                }
                else
                {
                    var subCeiling = await unitOfWork.SubOfficeCeilingRepository.FindAsync(
                        x => x.FiscalYearId == entity.FiscalYearId.Value && x.SubOfficeId == entity.OfficeId.Value && !x.IsDeleted,
                        cancellationToken);
                    if (subCeiling != null)
                    {
                        departmentCeiling = subCeiling.PSAmount + subCeiling.MOOEAmount + subCeiling.COAmount;
                    }
                }
            }

            var totalAmount = entity.TotalAmount;
            if (!LineItemBudgetValidationRules.ValidateDepartmentCeiling(totalAmount, departmentCeiling))
            {
                throw new ValidationException(
                    $"Cannot submit Line Item Budget: Total budget (₱{totalAmount:N2}) exceeds the department ceiling (₱{departmentCeiling!.Value:N2}).");
            }
        }

        entity.Status = nameof(LIBStatus.Submitted);
        entity.SubmittedDate = DateTime.UtcNow;

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB submitted successfully.");
    }
}
