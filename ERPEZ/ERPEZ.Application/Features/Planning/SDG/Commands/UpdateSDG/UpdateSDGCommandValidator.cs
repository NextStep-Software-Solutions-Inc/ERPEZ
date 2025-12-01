using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public class UpdateSDGRequestValidator : AbstractValidator<UpdateSDGRequest>
{
    public UpdateSDGRequestValidator()
    {
        RuleFor(p => p.Name)
            .MaximumLength(200).WithMessage("{PropertyName} must not exceed 200 characters.")
            .When(p => !string.IsNullOrWhiteSpace(p.Name));

        RuleFor(p => p.Description)
            .MaximumLength(1000).WithMessage("{PropertyName} must not exceed 1000 characters.")
            .When(p => !string.IsNullOrWhiteSpace(p.Description));
    }
}
