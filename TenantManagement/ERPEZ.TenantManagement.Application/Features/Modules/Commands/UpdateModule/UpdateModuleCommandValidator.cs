using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.UpdateModule;

/// <summary>
/// Validator for UpdateModuleCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateModuleCommandValidator : AbstractValidator<UpdateModuleCommand>
{
    public UpdateModuleCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
