using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

public class CreateWFPObjectiveCommandValidator : AbstractValidator<CreateWFPObjectiveCommand>
{
    public CreateWFPObjectiveCommandValidator()
    {
        // WFPId (Required GUID)
        RuleFor(x => x.WFPId)
            .NotEmpty()
            .WithMessage("WFP ID is required and must be a valid, non-empty GUID.");

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