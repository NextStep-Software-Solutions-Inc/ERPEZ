using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.CreateUNSPSCCode;

public class CreateUNSPSCCodeCommandValidator : AbstractValidator<CreateUNSPSCCodeCommand>
{
    public CreateUNSPSCCodeCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.");

        RuleFor(x => x.Level)
            .InclusiveBetween(1, 4)
            .WithMessage("Level must be between 1 and 4.");
    }
}
