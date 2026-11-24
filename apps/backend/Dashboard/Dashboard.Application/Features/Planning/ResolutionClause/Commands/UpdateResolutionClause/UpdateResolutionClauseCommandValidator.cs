using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.UpdateResolutionClause;

public class UpdateResolutionClauseCommandValidator : AbstractValidator<UpdateResolutionClauseCommand>
{
    public UpdateResolutionClauseCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID is required.");

        RuleFor(x => x.Request.Name)
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.Request.Name));
    }
}
