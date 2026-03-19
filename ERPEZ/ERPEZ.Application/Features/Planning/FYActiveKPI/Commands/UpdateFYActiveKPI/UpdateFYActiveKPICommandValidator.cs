using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.UpdateFYActiveKPI;

public class UpdateFYActiveKPICommandValidator : AbstractValidator<UpdateFYActiveKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();
    private readonly string[] validMeasurementUnits = Enum.GetNames<MeasurementUnitEnum>();
    private readonly string[] validMonitoringFrequencies = Enum.GetNames<MonitoringFrequencyEnum>();

    public UpdateFYActiveKPICommandValidator()
    {
        RuleFor(x => x.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Code)
            .MinimumLength(2)
            .WithMessage("KPI Code must be at least 2 characters long.")
            .MaximumLength(50)
            .WithMessage("KPI Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Code));

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("KPI Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.MeasurementUnit)
            .Must(BeAValidMeasurementUnit)
            .WithMessage($"Invalid MeasurementUnit. Allowed values are: {string.Join(", ", validMeasurementUnits)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.MeasurementUnit));

        RuleFor(x => x.DistributionBehavior)
            .Must(BeAValidDistributionBehavior)
            .WithMessage("Invalid DistributionBehavior. Allowed values are: Summation, Uniform, Maximum, Minimum, Milestone.")
            .When(x => !string.IsNullOrWhiteSpace(x.DistributionBehavior));

        RuleFor(x => x.FunctionCategory)
            .Must(BeAValidFunctionCategory)
            .WithMessage("Invalid FunctionCategory. Allowed values are: Core, Support, Strategic.")
            .When(x => !string.IsNullOrWhiteSpace(x.FunctionCategory));

        RuleFor(x => x.MonitoringFrequency)
            .Must(BeAValidMonitoringFrequency)
            .WithMessage($"Invalid MonitoringFrequency. Allowed values are: {string.Join(", ", validMonitoringFrequencies)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.MonitoringFrequency));

        RuleFor(x => x.Status)
            .Must(status => validStatuses.Contains(status!))
            .WithMessage($"Status must be one of: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));
    }

    private bool BeAValidMeasurementUnit(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        return Enum.TryParse<MeasurementUnitEnum>(value, true, out _);
    }

    private bool BeAValidDistributionBehavior(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        return Enum.TryParse<DistributionBehaviorEnum>(value, true, out _);
    }

    private bool BeAValidFunctionCategory(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        return Enum.TryParse<FunctionCategoryEnum>(value, true, out _);
    }

    private bool BeAValidMonitoringFrequency(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        return Enum.TryParse<MonitoringFrequencyEnum>(value, true, out _);
    }
}
