using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Attribute.Commands.DeleteAttribute;

/// <summary>
/// Validator for DeleteAttributeCommand ensuring the ID is valid.
/// </summary>
public class DeleteAttributeCommandValidator : AbstractValidator<DeleteAttributeCommand>
{
    public DeleteAttributeCommandValidator()
    {
        RuleFor(attribute => attribute.Id)
            .NotEmpty().WithMessage("Attribute ID is required.");
    }
}
