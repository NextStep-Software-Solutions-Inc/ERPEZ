using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

/// <summary>
/// Validator for UpdateTenantCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
