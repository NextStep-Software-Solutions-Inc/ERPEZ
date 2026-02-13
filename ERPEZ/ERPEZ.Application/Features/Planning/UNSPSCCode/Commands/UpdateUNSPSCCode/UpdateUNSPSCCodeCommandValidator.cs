using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.UpdateUNSPSCCode;

public class UpdateUNSPSCCodeCommandValidator : AbstractValidator<UpdateUNSPSCCodeCommand>
{
    public UpdateUNSPSCCodeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Code));

        RuleFor(x => x.Name)
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Level)
            .InclusiveBetween(1, 4)
            .WithMessage("Level must be between 1 and 4.")
            .When(x => x.Level.HasValue);
    }
}
