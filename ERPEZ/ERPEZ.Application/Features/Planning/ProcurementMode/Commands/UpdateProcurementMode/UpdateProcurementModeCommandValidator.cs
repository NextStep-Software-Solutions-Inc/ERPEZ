using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UpdateProcurementMode;

public class UpdateProcurementModeCommandValidator : AbstractValidator<UpdateProcurementModeCommand>
{
    public UpdateProcurementModeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
