using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public class UpdateSDGCommandValidator : AbstractValidator<UpdateSDGCommand>
{
    public UpdateSDGCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.Name)
            .NotEmpty().WithMessage("{PropertyName} is required.")
            .NotNull()
            .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.");

        RuleFor(p => p.Description)
            .MaximumLength(1000).WithMessage("{PropertyName} must not exceed 1000 characters.");
    }
}
