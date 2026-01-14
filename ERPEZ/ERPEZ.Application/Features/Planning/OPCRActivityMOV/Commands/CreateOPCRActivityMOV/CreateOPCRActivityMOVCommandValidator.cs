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

        // FileName (Required, with length constraints)
        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithMessage("File Name is required.")
            .MinimumLength(3)
            .WithMessage("File Name must be at least 3 characters.")
            .MaximumLength(500)
            .WithMessage("File Name cannot exceed 500 characters.");

        // Url (Optional, but with max length constraint and format validation)
        RuleFor(x => x.Url)
            .MaximumLength(2000)
            .WithMessage("URL cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Url));

        // Validate URL format if provided
        RuleFor(x => x.Url)
            .Must(BeAValidUrl)
            .WithMessage("URL must be a valid URL format.")
            .When(x => !string.IsNullOrWhiteSpace(x.Url));

        // UploadedDate validation
        RuleFor(x => x.UploadedDate)
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Uploaded Date cannot be in the future.")
            .When(x => x.UploadedDate.HasValue);
    }

    private static bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
