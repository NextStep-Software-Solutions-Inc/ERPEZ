using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.DeleteTenantSetting;

/// <summary>
/// Validator for DeleteTenantSettingCommand.
/// TODO: Add validation rules
/// </summary>
public class DeleteTenantSettingCommandValidator : AbstractValidator<DeleteTenantSettingCommand>
{
    public DeleteTenantSettingCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
