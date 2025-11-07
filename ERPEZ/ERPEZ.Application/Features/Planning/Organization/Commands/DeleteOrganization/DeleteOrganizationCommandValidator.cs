using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.DeleteOrganization;

public class DeleteOrganizationCommandValidator : AbstractValidator<DeleteOrganizationCommand>
{
    public DeleteOrganizationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Organization ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Organization ID must be a valid, non-empty GUID.");
    }
}