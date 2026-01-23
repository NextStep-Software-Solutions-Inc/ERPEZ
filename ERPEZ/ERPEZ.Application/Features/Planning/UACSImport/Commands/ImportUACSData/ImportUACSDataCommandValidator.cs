using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSImport.Commands.ImportUACSData;

/// <summary>
/// Validator for ImportUACSDataCommand ensuring all input meets requirements.
/// </summary>
public class ImportUACSDataCommandValidator : AbstractValidator<ImportUACSDataCommand>
{
    private const long maxFileSizeBytes = 10 * 1024 * 1024;
    private readonly string[] allowedExtensions = [".csv"];

    public ImportUACSDataCommandValidator()
    {
        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("CSV file is required.");

        RuleFor(x => x.File.Length)
            .LessThanOrEqualTo(maxFileSizeBytes)
            .WithMessage($"File size cannot exceed {maxFileSizeBytes / (1024 * 1024)} MB.")
            .When(x => x.File != null);

        RuleFor(x => x.File.FileName)
            .Must(fileName => allowedExtensions.Any(ext => fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Only CSV files are allowed.")
            .When(x => x.File != null && !string.IsNullOrEmpty(x.File.FileName));

        RuleFor(x => x.SegmentType)
            .IsInEnum()
            .WithMessage("Invalid segment type.");

        RuleFor(x => x.ImportedBy)
            .NotEmpty()
            .WithMessage("ImportedBy is required.")
            .MinimumLength(3)
            .WithMessage("ImportedBy must be at least 3 characters.")
            .MaximumLength(100)
            .WithMessage("ImportedBy cannot exceed 100 characters.");
    }
}
