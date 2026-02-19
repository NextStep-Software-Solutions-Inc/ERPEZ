using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.DeletePMTMember;

/// <summary>
/// Validator for DeletePMTMemberCommand ensuring the ID is provided.
/// </summary>
public class DeletePMTMemberCommandValidator : AbstractValidator<DeletePMTMemberCommand>
{
    public DeletePMTMemberCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PMT member ID is required for deletion.");
    }
}
