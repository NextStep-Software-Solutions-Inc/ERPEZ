using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.UpdateTenantSubscription;

/// <summary>
/// Validator for UpdateTenantSubscriptionCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateTenantSubscriptionCommandValidator : AbstractValidator<UpdateTenantSubscriptionCommand>
{
    public UpdateTenantSubscriptionCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
