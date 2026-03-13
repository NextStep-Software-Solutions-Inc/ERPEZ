using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;

public class UpdateFYActiveKPICommandValidator : AbstractValidator<UpdateFYActiveKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();

    public UpdateFYActiveKPICommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("FY Active KPI ID is required.");

        RuleFor(x => x.AgencyTargetAnnual)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency Target Annual must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ1)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency Target Q1 must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ1.HasValue);

        RuleFor(x => x.AgencyTargetQ2)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency Target Q2 must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ2.HasValue);

        RuleFor(x => x.AgencyTargetQ3)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency Target Q3 must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ3.HasValue);

        RuleFor(x => x.AgencyTargetQ4)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency Target Q4 must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ4.HasValue);

        RuleFor(x => x.Status)
            .Must(status => validStatuses.Contains(status!))
            .WithMessage($"Status must be one of: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));
    }
}
