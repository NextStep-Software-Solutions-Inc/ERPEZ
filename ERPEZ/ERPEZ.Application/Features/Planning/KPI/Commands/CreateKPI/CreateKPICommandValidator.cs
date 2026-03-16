using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
{
    private readonly string[] validMeasurementUnits = Enum.GetNames<MeasurementUnitEnum>();
    private readonly string[] validDistributionBehaviors = Enum.GetNames<DistributionBehaviorEnum>();
    private readonly string[] validFunctionCategories = Enum.GetNames<FunctionCategoryEnum>();
    private readonly string[] validMonitoringFrequencies = Enum.GetNames<MonitoringFrequencyEnum>();

    public CreateKPICommandValidator()
    {
        RuleFor(x => x.ParentKPIId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
            .When(x => x.ParentKPIId.HasValue);

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("KPI Name is required.")
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("KPI Code is required.")
            .MaximumLength(50)
            .WithMessage("KPI Code cannot exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.MeasurementUnit)
            .NotEmpty()
            .WithMessage("Measurement Unit is required.")
            .Must(unit => validMeasurementUnits.Contains(unit))
            .WithMessage($"Measurement Unit must be one of: {string.Join(", ", validMeasurementUnits)}.");

        RuleFor(x => x.DistributionBehavior)
            .NotEmpty()
            .WithMessage("Distribution Behavior is required.")
            .Must(behavior => validDistributionBehaviors.Contains(behavior))
            .WithMessage($"Distribution Behavior must be one of: {string.Join(", ", validDistributionBehaviors)}.");

        RuleFor(x => x.FunctionCategory)
            .NotEmpty()
            .WithMessage("Function Category is required.")
            .Must(category => validFunctionCategories.Contains(category))
            .WithMessage($"Function Category must be one of: {string.Join(", ", validFunctionCategories)}.");

        RuleFor(x => x.MonitoringFrequency)
            .Must(freq => string.IsNullOrEmpty(freq) || validMonitoringFrequencies.Contains(freq))
            .WithMessage($"Monitoring Frequency must be one of: {string.Join(", ", validMonitoringFrequencies)}.")
            .When(x => !string.IsNullOrEmpty(x.MonitoringFrequency));

        RuleFor(x => x.IsOptInAvailable)
            .NotNull()
            .WithMessage("Is Opt-In Available/Shoppable must be provided (true or false).");

        RuleFor(x => x.IsGAD)
            .NotNull()
            .WithMessage("Is GAD must be provided (true or false).");

        RuleForEach(x => x.SDGIds)
            .NotEmpty()
            .WithMessage("SDG ID cannot be empty.");

        RuleForEach(x => x.AttributeIds)
            .NotEmpty()
            .WithMessage("Attribute ID cannot be empty.");
    }
}
