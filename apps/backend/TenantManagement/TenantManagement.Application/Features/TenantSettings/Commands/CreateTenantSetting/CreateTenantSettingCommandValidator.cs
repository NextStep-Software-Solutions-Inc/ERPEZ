using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.CreateTenantSetting;

/// <summary>
/// Validator for CreateTenantSettingCommand.
/// TODO: Add validation rules
/// </summary>
public class CreateTenantSettingCommandValidator : AbstractValidator<CreateTenantSettingCommand>
{
    public CreateTenantSettingCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
