using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

public class UpdateTenantMemberCommandValidator : AbstractValidator<UpdateTenantMemberCommand>
{
    public UpdateTenantMemberCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Member ID is required.");
        RuleFor(x => x.UpdateTenantMember).NotNull().WithMessage("Update payload is required.");
        RuleFor(x => x.UpdateTenantMember.ConcurrencyStamp).NotEmpty().WithMessage("ConcurrencyStamp is required.");
        RuleFor(x => x.UpdateTenantMember.RoleIds)
            .NotNull().WithMessage("RoleIds is required.")
            .Must(roles => roles != null && roles.Count > 0).WithMessage("At least one role must be assigned.");
    }
}
