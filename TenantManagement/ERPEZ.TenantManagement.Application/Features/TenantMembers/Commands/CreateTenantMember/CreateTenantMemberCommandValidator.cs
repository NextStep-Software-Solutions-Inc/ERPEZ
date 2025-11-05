using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

/// <summary>
/// Validator for CreateTenantMemberCommand.
/// TODO: Add validation rules
/// </summary>
public class CreateTenantMemberCommandValidator : AbstractValidator<CreateTenantMemberCommand>
{
    public CreateTenantMemberCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
