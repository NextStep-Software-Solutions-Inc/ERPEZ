using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.UpdateBACResolutionWhereasClause;

/// <summary>
/// Validator for UpdateBACResolutionWhereasClauseCommand ensuring update payload is valid.
/// </summary>
public class UpdateBACResolutionWhereasClauseCommandValidator : AbstractValidator<UpdateBACResolutionWhereasClauseCommand>
{
    public UpdateBACResolutionWhereasClauseCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Whereas clause ID is required.");

        RuleFor(x => x.UpdateWhereasClause)
            .NotNull()
            .WithMessage("Update payload is required.");

        When(x => x.UpdateWhereasClause is not null, () =>
        {
            RuleFor(x => x.UpdateWhereasClause.Name)
                .NotEmpty()
                .When(x => x.UpdateWhereasClause.Name is not null)
                .MaximumLength(300)
                .WithMessage("Whereas title cannot exceed 300 characters.");

            RuleFor(x => x.UpdateWhereasClause.Body)
                .NotEmpty()
                .When(x => x.UpdateWhereasClause.Body is not null)
                .MaximumLength(20000)
                .WithMessage("Whereas body cannot exceed 20000 characters.");
        });
    }
}
