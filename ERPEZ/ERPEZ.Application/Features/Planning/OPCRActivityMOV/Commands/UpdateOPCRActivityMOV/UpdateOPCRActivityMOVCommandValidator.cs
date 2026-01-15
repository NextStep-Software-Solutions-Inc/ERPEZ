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

        // FileName (Optional, but with length constraints if provided)
        RuleFor(x => x.UpdateMOV.FileName)
            .MinimumLength(3)
            .WithMessage("File Name must be at least 3 characters.")
            .MaximumLength(500)
            .WithMessage("File Name cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateMOV.FileName));

        // Url (Optional, but with max length constraint and format validation)
        RuleFor(x => x.UpdateMOV.Url)
            .MaximumLength(2000)
            .WithMessage("URL cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateMOV.Url));

        // Validate URL format if provided
        RuleFor(x => x.UpdateMOV.Url)
            .Must(ValidationUtilities.IsValidHttpUrl)
            .WithMessage("URL must be a valid URL format.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateMOV.Url));

        // UploadedDate validation
        RuleFor(x => x.UpdateMOV.UploadedDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Uploaded Date cannot be in the future.")
            .When(x => x.UpdateMOV.UploadedDate.HasValue);
    }
}
