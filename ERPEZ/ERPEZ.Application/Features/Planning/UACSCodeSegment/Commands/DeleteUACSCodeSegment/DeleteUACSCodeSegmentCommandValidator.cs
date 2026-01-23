using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.DeleteUACSCodeSegment;

/// <summary>
/// Validator for DeleteUACSCodeSegmentCommand ensuring the ID is provided.
/// </summary>
public class DeleteUACSCodeSegmentCommandValidator : AbstractValidator<DeleteUACSCodeSegmentCommand>
{
    public DeleteUACSCodeSegmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("UACS code segment ID is required for deletion.");
    }
}
