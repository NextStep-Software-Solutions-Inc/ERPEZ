using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public class UpdateSDGCommandValidator : AbstractValidator<UpdateSDGCommand>
{
    public UpdateSDGCommandValidator()
    {
        RuleFor(p => p.Id)
            .NotEmpty().WithMessage("{PropertyName} is required.");

        RuleFor(p => p.Name)
            .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.")
            .When(p => p.Name != null);

        RuleFor(p => p.Description)
            .MaximumLength(1000).WithMessage("{PropertyName} must not exceed 1000 characters.")
            .When(p => p.Description != null);

        RuleFor(p => p.SdgCode)
            .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.")
            .When(p => p.SdgCode != null);
    }
}
