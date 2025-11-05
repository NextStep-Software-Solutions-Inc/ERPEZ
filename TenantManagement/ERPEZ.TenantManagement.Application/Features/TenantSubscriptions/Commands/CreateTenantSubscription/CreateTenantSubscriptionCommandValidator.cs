using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.CreateTenantSubscription;

/// <summary>
/// Validator for CreateTenantSubscriptionCommand.
/// TODO: Add validation rules
/// </summary>
public class CreateTenantSubscriptionCommandValidator : AbstractValidator<CreateTenantSubscriptionCommand>
{
    public CreateTenantSubscriptionCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
