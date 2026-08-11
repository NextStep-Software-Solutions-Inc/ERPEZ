using FluentValidation;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.UpdateAdministrativeLevel;

public class UpdateAdministrativeLevelCommandValidator : AbstractValidator<UpdateAdministrativeLevelCommand>
{
    public UpdateAdministrativeLevelCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Administrative Level ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Administrative Level ID must be a valid, non-empty GUID.");

        When(x => x.UpdateAdministrativeLevel.Name != null, () =>
        {
            RuleFor(x => x.UpdateAdministrativeLevel.Name!)
                .NotEmpty()
                .WithMessage("Name is required.")
                .MaximumLength(200)
                .WithMessage("Name cannot exceed 200 characters.");
        });

        When(x => x.UpdateAdministrativeLevel.Code != null, () =>
        {
            RuleFor(x => x.UpdateAdministrativeLevel.Code!)
                .NotEmpty()
                .WithMessage("Code is required.")
                .MaximumLength(50)
                .WithMessage("Code cannot exceed 50 characters.");
        });
    }
}
