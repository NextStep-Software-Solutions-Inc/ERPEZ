using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.DeleteTenantMember;

/// <summary>
/// Validator for DeleteTenantMemberCommand.
/// TODO: Add validation rules
/// </summary>
public class DeleteTenantMemberCommandValidator : AbstractValidator<DeleteTenantMemberCommand>
{
    public DeleteTenantMemberCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
