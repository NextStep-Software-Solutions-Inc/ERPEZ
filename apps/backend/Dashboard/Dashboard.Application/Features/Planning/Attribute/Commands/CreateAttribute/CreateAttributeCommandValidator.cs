using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.CreateAttribute;

/// <summary>
/// Validator for CreateAttributeCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateAttributeCommandValidator : AbstractValidator<CreateAttributeCommand>
{
    public CreateAttributeCommandValidator()
    {
        RuleFor(attribute => attribute.Name)
            .NotEmpty().WithMessage("Attribute name is required.")
            .MaximumLength(200).WithMessage("Attribute name must not exceed 200 characters.");

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
