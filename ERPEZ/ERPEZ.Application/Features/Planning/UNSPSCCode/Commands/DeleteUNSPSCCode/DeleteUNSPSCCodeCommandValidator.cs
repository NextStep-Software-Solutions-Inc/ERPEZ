using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.DeleteUNSPSCCode;

public class DeleteUNSPSCCodeCommandValidator : AbstractValidator<DeleteUNSPSCCodeCommand>
{
    public DeleteUNSPSCCodeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UNSPSC code ID is required for deletion.");
    }
}
