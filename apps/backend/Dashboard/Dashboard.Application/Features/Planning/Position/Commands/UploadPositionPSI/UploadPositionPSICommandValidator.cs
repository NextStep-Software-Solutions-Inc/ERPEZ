using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UploadPositionPSI;

public class UploadPositionPSICommandValidator : AbstractValidator<UploadPositionPSICommand>
{
    private static readonly string[] allowedExtensions = { ".xlsx", ".xls" };
    private const long maxFileSize = 10 * 1024 * 1024; // 10MB

    public UploadPositionPSICommandValidator()
    {
        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("File is required.");

        RuleFor(x => x.File.Length)
            .LessThanOrEqualTo(maxFileSize)
            .WithMessage($"File size cannot exceed {maxFileSize / 1024 / 1024}MB.")
            .When(x => x.File != null);

        RuleFor(x => x.File.FileName)
            .Must(fileName => allowedExtensions.Any(ext => fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Only Excel files (.xlsx, .xls) are allowed.")
            .When(x => x.File != null);
    }
}
