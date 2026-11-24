using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.DeleteOfficeType;

/// <summary>
/// Validator for DeleteOfficeTypeCommand ensuring the ID is provided.
/// </summary>
public class DeleteOfficeTypeCommandValidator : AbstractValidator<DeleteOfficeTypeCommand>
{
    public DeleteOfficeTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Office type ID is required for deletion.");
    }
}
