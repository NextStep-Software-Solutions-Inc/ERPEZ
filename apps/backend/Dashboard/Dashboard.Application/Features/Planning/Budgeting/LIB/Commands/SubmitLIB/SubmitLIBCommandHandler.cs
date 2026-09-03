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

        entity.Status = nameof(LIBStatus.Submitted);
        entity.SubmittedDate = DateTime.UtcNow;

        unitOfWork.LineItemBudgetRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "LIB submitted successfully.");
    }
}
