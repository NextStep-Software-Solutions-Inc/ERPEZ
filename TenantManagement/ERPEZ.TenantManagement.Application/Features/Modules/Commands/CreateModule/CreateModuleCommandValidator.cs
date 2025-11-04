using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.CreateModule;

/// <summary>
/// Validator for CreateModuleCommand.
/// TODO: Add validation rules
/// </summary>
public class CreateModuleCommandValidator : AbstractValidator<CreateModuleCommand>
{
    public CreateModuleCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
