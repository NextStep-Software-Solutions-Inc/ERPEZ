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

        RuleFor(x => x.MinThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Min threshold must be greater than or equal to 0.")
            .When(x => x.MinThreshold.HasValue);

        RuleFor(x => x.MaxThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Max threshold must be greater than or equal to 0.")
            .When(x => x.MaxThreshold.HasValue);

        RuleFor(x => x)
            .Must(x => !x.MinThreshold.HasValue || !x.MaxThreshold.HasValue || x.MaxThreshold.Value >= x.MinThreshold.Value)
            .WithMessage("Max threshold must be greater than or equal to min threshold.");
    }
}
