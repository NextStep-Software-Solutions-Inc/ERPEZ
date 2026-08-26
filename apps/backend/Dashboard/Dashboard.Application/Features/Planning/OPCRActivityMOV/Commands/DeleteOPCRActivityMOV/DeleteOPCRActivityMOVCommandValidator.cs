using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.DeleteOPCRActivityMOV;

/// <summary>
/// Validator for DeleteOPCRActivityMOVCommand ensuring the ID is valid.
/// </summary>
public class DeleteOPCRActivityMOVCommandValidator : AbstractValidator<DeleteOPCRActivityMOVCommand>
{
    public DeleteOPCRActivityMOVCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MOV ID is required and must be a valid, non-empty GUID.");
    }
}
