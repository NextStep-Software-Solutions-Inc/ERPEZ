using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.UpdateProcurementModeThreshold;

public class UpdateProcurementModeThresholdCommandValidator : AbstractValidator<UpdateProcurementModeThresholdCommand>
{
    public UpdateProcurementModeThresholdCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.MinThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum threshold must be greater than or equal to 0.")
            .When(x => x.MinThreshold.HasValue);

        RuleFor(x => x.MaxThreshold)
            .GreaterThan(x => x.MinThreshold!.Value)
            .WithMessage("Maximum threshold must be greater than minimum threshold.")
            .When(x => x.MaxThreshold.HasValue && x.MinThreshold.HasValue);
    }
}
