using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.UpdatePositionType;

public class UpdatePositionTypeCommandValidator : AbstractValidator<UpdatePositionTypeCommand>
{
    public UpdatePositionTypeCommandValidator()
    {
        RuleFor(x => x.Request.Name)
            .MaximumLength(200).WithMessage("Position Type Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Request.Name));

        RuleFor(x => x.Request.Code)
            .MaximumLength(50).WithMessage("Position Type Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Request.Code));
    }
}
