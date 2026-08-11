using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OfficeType.Commands.UpdateOfficeType;

public class UpdateOfficeTypeCommandValidator : AbstractValidator<UpdateOfficeTypeCommand>
{
    public UpdateOfficeTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OfficeType ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OfficeType ID must be a valid, non-empty GUID.");

        When(x => x.UpdateOfficeType.Name != null, () =>
        {
            RuleFor(x => x.UpdateOfficeType.Name!)
                .NotEmpty()
                .WithMessage("Name is required.")
                .MaximumLength(200)
                .WithMessage("Name cannot exceed 200 characters.");
        });

        When(x => x.UpdateOfficeType.Code != null, () =>
        {
            RuleFor(x => x.UpdateOfficeType.Code!)
                .NotEmpty()
                .WithMessage("Code is required.")
                .MaximumLength(50)
                .WithMessage("Code cannot exceed 50 characters.");
        });
    }
}
