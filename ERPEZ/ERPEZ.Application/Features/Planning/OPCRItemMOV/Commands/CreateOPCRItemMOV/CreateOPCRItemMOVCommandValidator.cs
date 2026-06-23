// CreateOPCRItemMOVCommandValidator.cs
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public class CreateOPCRItemMOVCommandValidator : AbstractValidator<CreateOPCRItemMOVCommand>
{
    public CreateOPCRItemMOVCommandValidator()
    {
        RuleFor(x => x.OPCRItemId)
            .NotEmpty()
            .WithMessage("OPCR Item ID is required.");

        RuleFor(x => x.RequirementName)
            .NotEmpty()
            .WithMessage("Requirement Name is required.")
            .MaximumLength(500)
            .WithMessage("Requirement Name cannot exceed 500 characters.");

        RuleFor(x => x.FileId)
            .NotEmpty()
            .WithMessage("File ID is required. Upload a file first via POST /files/upload.");
    }
}