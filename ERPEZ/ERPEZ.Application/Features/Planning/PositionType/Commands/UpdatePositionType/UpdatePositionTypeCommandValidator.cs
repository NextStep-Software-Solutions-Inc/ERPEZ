using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;

public class UpdatePositionTypeCommandValidator : AbstractValidator<UpdatePositionTypeCommand>
{
    public UpdatePositionTypeCommandValidator()
    {
        RuleFor(x => x.UpdatePositionType.Name)
            .MaximumLength(200).WithMessage("Position Type Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePositionType.Name));

        RuleFor(x => x.UpdatePositionType.Code)
            .MaximumLength(50).WithMessage("Position Type Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePositionType.Code));
    }
}

