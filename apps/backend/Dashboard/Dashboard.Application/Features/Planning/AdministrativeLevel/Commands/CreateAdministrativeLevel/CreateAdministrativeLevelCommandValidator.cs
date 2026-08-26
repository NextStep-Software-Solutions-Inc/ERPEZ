using FluentValidation;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.CreateAdministrativeLevel;

public class CreateAdministrativeLevelCommandValidator : AbstractValidator<CreateAdministrativeLevelCommand>
{
    public CreateAdministrativeLevelCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Administrative Level Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Administrative Level Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");
    }
}
