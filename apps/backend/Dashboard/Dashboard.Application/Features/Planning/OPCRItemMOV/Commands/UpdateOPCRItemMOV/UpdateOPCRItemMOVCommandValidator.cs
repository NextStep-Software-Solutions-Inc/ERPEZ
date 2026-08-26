// UpdateOPCRItemMOVCommandValidator.cs
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVCommandValidator : AbstractValidator<UpdateOPCRItemMOVCommand>
{
    public UpdateOPCRItemMOVCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Item MOV ID is required.");

        // RequirementName is optional on update — only validate if provided
        RuleFor(x => x.Request.RequirementName)
            .MaximumLength(500)
            .WithMessage("Requirement Name cannot exceed 500 characters.")
            .When(x => x.Request.RequirementName != null);

        RuleFor(x => x.Request.FYActiveKPIMeasurementId)
            .NotEmpty()
            .WithMessage("FY Active KPI Measurement ID must be a valid non-empty GUID when provided.")
            .When(x => x.Request.FYActiveKPIMeasurementId.HasValue);

        // FileId is optional on update — only validate if provided
        RuleFor(x => x.Request.FileId)
            .NotEmpty()
            .WithMessage("File ID must be a valid non-empty GUID when provided.")
            .When(x => x.Request.FileId.HasValue);
    }
}