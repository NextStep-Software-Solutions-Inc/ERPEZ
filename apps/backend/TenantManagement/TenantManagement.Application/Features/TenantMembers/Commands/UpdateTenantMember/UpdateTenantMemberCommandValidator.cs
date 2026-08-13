using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

/// <summary>
/// Validator for UpdateTenantMemberCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateTenantMemberCommandValidator : AbstractValidator<UpdateTenantMemberCommand>
{
    public UpdateTenantMemberCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
