using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.CreateSDG;

public class CreateSDGCommandValidator : AbstractValidator<CreateSDGCommand>
{
    public CreateSDGCommandValidator()
    {
        RuleFor(p => p.Name)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .NotNull()
            .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.");

        RuleFor(p => p.Description)
            .MaximumLength(1000).WithMessage("{PropertyName} must not exceed 1000 characters.");
    }
}
