using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;

/// <summary>
/// Validator for UpdateTenantSettingCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateTenantSettingCommandValidator : AbstractValidator<UpdateTenantSettingCommand>
{
    public UpdateTenantSettingCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
