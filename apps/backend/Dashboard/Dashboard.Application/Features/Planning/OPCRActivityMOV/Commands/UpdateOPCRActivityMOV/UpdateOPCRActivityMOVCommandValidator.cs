using ERPEZ.Application.Common.Validators;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.UpdateOPCRActivityMOV;

/// <summary>
/// Validator for UpdateOPCRActivityMOVCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateOPCRActivityMOVCommandValidator : AbstractValidator<UpdateOPCRActivityMOVCommand>
{
    public UpdateOPCRActivityMOVCommandValidator()
    {
        // ID (Required GUID)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MOV ID is required and must be a valid, non-empty GUID.");

        // UpdateMOV (Required)
        RuleFor(x => x.UpdateMOV)
            .NotNull()
            .WithMessage("Update MOV data is required.");

        // FileId (Optional GUID, but must be valid if provided)
        RuleFor(x => x.UpdateMOV.FileId)
            .NotEmpty()
            .WithMessage("File ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateMOV.FileId.HasValue);
    }
}
