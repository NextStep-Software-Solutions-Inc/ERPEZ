using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;

/// <summary>
/// Validator for UpdateAttributeRequest ensuring all user input meets business requirements.
/// </summary>
public class UpdateAttributeRequestValidator : AbstractValidator<UpdateAttributeRequest>
{
    public UpdateAttributeRequestValidator()
    {
        RuleFor(attribute => attribute.Name)
            .MaximumLength(200).WithMessage("Attribute name must not exceed 200 characters.")
            .When(attribute => !string.IsNullOrWhiteSpace(attribute.Name));

        RuleFor(attribute => attribute.Code)
            .MaximumLength(50).WithMessage("Attribute code must not exceed 50 characters.")
            .When(attribute => !string.IsNullOrWhiteSpace(attribute.Code));

        RuleFor(attribute => attribute.Description)
            .MaximumLength(1000).WithMessage("Attribute description must not exceed 1000 characters.")
            .When(attribute => !string.IsNullOrWhiteSpace(attribute.Description));

        RuleFor(attribute => attribute.ParentAttributeId)
            .NotEmpty().WithMessage("Parent Attribute ID must be a valid GUID.")
            .When(attribute => attribute.ParentAttributeId.HasValue);
    }
}
