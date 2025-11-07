using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.CreateWFPOutcome;

public class CreateWFPOutcomeCommandValidator : AbstractValidator<CreateWFPOutcomeCommand>
{
    public CreateWFPOutcomeCommandValidator()
    {
        // WFPObjectiveId (Required GUID)
        RuleFor(x => x.WFPObjectiveId)
            .NotEmpty()
            .WithMessage("WFP Objective ID is required and must be a valid, non-empty GUID.");

        // Description (Required String, Min/Max Length)
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters long.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");
    }
}