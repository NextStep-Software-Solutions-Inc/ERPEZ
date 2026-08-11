using ERPEZ.Application.Common.Validators;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.CreateOPCRActivityMOV;

/// <summary>
/// Validator for CreateOPCRActivityMOVCommand ensuring all user input meets business requirements
/// and enforces strict validation rules for OPCR Activity MOV creation.
/// </summary>
public class CreateOPCRActivityMOVCommandValidator : AbstractValidator<CreateOPCRActivityMOVCommand>
{
    public CreateOPCRActivityMOVCommandValidator()
    {
        // OPCRActivityId (Required GUID)
        RuleFor(x => x.OPCRActivityId)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required and must be a valid, non-empty GUID.");

        // FileId (Required GUID)
        RuleFor(x => x.FileId)
            .NotEmpty()
            .WithMessage("File ID is required and must be a valid, non-empty GUID.");
    }
}
