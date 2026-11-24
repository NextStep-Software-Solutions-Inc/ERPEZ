using ERPEZ.TenantManagement.Domain.Enums;
using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.ToggleTenantMemberStatus;

public class ToggleTenantMemberStatusCommandValidator : AbstractValidator<ToggleTenantMemberStatusCommand>
{
    public ToggleTenantMemberStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Member ID is required.");
        RuleFor(x => x.ConcurrencyStamp).NotEmpty().WithMessage("ConcurrencyStamp is required.");
        RuleFor(x => x.Status)
            .Must(s => s == Status.Active || s == Status.Disabled)
            .WithMessage("Status must be either Active or Disabled.");
    }
}
