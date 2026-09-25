using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Commands.AssignOperationalRoles;

public class AssignOperationalRolesCommandValidator : AbstractValidator<AssignOperationalRolesCommand>
{
    public AssignOperationalRolesCommandValidator()
    {
        RuleFor(x => x.TargetTenantMemberId)
            .NotEmpty().WithMessage("Target tenant member ID is required.");

        RuleFor(x => x.RoleIds)
            .NotNull().WithMessage("Role IDs collection cannot be null.");
    }
}
