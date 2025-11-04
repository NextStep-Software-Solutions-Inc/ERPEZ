using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;

/// <summary>
/// Validator for DeleteTenantCommand.
/// TODO: Add validation rules
/// </summary>
public class DeleteTenantCommandValidator : AbstractValidator<DeleteTenantCommand>
{
    public DeleteTenantCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
