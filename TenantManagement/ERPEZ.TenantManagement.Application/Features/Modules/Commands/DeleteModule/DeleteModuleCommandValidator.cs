using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;

/// <summary>
/// Validator for DeleteModuleCommand.
/// TODO: Add validation rules
/// </summary>
public class DeleteModuleCommandValidator : AbstractValidator<DeleteModuleCommand>
{
    public DeleteModuleCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
