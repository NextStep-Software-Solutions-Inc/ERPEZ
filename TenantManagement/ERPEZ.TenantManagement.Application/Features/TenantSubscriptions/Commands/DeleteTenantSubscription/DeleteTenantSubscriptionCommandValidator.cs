using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Commands.DeleteTenantSubscription;

/// <summary>
/// Validator for DeleteTenantSubscriptionCommand.
/// TODO: Add validation rules
/// </summary>
public class DeleteTenantSubscriptionCommandValidator : AbstractValidator<DeleteTenantSubscriptionCommand>
{
    public DeleteTenantSubscriptionCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
