using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMT.Commands.DeletePMT;

/// <summary>
/// Validator for DeletePMTCommand ensuring the ID is provided.
/// </summary>
public class DeletePMTCommandValidator : AbstractValidator<DeletePMTCommand>
{
    public DeletePMTCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PMT ID is required for deletion.");
    }
}
