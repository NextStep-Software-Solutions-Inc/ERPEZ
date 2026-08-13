using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.CreateOfficeType;

public class CreateOfficeTypeCommandValidator : AbstractValidator<CreateOfficeTypeCommand>
{
    public CreateOfficeTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("OfficeType Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("OfficeType Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");
    }
}
