using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjectivesBatch;

/// <summary>
/// Validator for CreateWFPObjectivesBatchCommand ensuring all batch input meets business requirements.
/// </summary>
public class CreateWFPObjectivesBatchCommandValidator : AbstractValidator<CreateWFPObjectivesBatchCommand>
{
    public CreateWFPObjectivesBatchCommandValidator()
    {
        RuleFor(command => command.WFPId)
            .NotEmpty()
            .WithMessage("Work and Financial Plan ID is required.");

        RuleFor(command => command.WFPObjectives)
            .NotEmpty()
            .WithMessage("At least one WFP Objective is required.");

        RuleForEach(command => command.WFPObjectives)
            .ChildRules(objective =>
            {
                objective.RuleFor(o => o.Description)
                    .NotEmpty()
                    .WithMessage("Objective description is required.")
                    .MinimumLength(10)
                    .WithMessage("Objective description must be at least 10 characters.")
                    .MaximumLength(1000)
                    .WithMessage("Objective description cannot exceed 1000 characters.");

                objective.RuleFor(o => o.Weight)
                    .GreaterThan(0)
                    .WithMessage("Objective weight must be greater than 0.")
                    .LessThanOrEqualTo(100)
                    .WithMessage("Objective weight cannot exceed 100.");

                objective.RuleFor(o => o.Outcome)
                    .MaximumLength(1000)
                    .WithMessage("Outcome cannot exceed 1000 characters.")
                    .When(o => !string.IsNullOrWhiteSpace(o.Outcome));
            });
    }
}
