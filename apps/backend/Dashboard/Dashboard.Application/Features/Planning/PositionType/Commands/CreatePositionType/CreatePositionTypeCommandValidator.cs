using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.CreatePositionType;

public class CreatePositionTypeCommandValidator : AbstractValidator<CreatePositionTypeCommand>
{
    public CreatePositionTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Position Type Name is required.")
            .MaximumLength(200).WithMessage("Position Type Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Position Type Code is required.")
            .MaximumLength(50).WithMessage("Position Type Code cannot exceed 50 characters.");
    }
}
