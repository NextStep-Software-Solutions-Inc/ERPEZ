using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.CreateResolutionClause;

public class CreateResolutionClauseCommandValidator : AbstractValidator<CreateResolutionClauseCommand>
{
    public CreateResolutionClauseCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Body)
            .NotEmpty().WithMessage("Body is required.");

        RuleFor(x => x.ClauseType)
            .NotEmpty().WithMessage("ClauseType is required.");
    }
}
