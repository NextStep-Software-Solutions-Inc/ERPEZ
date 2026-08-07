using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.DeleteLIBActivity;

public class DeleteLIBActivityCommandValidator : AbstractValidator<DeleteLIBActivityCommand>
{
    public DeleteLIBActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}



