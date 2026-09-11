using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.AcceptInvitation;

public class AcceptInvitationCommandValidator : AbstractValidator<AcceptInvitationCommand>
{
    public AcceptInvitationCommandValidator()
    {
        RuleFor(x => x.InvitationToken)
            .NotEmpty().WithMessage("Invitation token is required.");
    }
}
