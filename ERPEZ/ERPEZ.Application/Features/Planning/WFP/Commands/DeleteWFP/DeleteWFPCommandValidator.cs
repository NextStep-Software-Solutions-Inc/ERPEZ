using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.DeleteWFP;

public class DeleteWFPCommandValidator : AbstractValidator<DeleteWFPCommand>
{
    public DeleteWFPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP ID is required.");
    }
}
