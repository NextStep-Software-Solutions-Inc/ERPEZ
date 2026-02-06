using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Position.Commands.CreatePosition;

public class CreatePositionCommandValidator : AbstractValidator<CreatePositionCommand>
{
    private static readonly string[] allowedOperationalStatuses = ["Vacant", "Filled", "Abolished"];

    public CreatePositionCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required.")
            .MaximumLength(200)
            .WithMessage("Title cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.FTE)
            .GreaterThan(0)
            .WithMessage("FTE must be greater than 0.")
            .When(x => x.FTE.HasValue);

        RuleFor(x => x.OperationalStatus)
            .NotEmpty()
            .WithMessage("Operational Status is required.")
            .Must(status => allowedOperationalStatuses.Contains(status))
            .WithMessage($"Operational Status must be one of: {string.Join(", ", allowedOperationalStatuses)}.");

        RuleFor(x => x.PositionTypeId)
            .NotEmpty()
            .WithMessage("Position Type ID is required.");

        RuleFor(x => x.PlantillaTypeId)
            .NotEmpty()
            .WithMessage("Plantilla Type ID is required.");

        RuleFor(x => x.SalaryGradeId)
            .NotEmpty()
            .WithMessage("Salary Grade ID is required.");

        RuleFor(x => x.StepId)
            .NotEmpty()
            .WithMessage("Step ID is required.");

        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");
    }
}
