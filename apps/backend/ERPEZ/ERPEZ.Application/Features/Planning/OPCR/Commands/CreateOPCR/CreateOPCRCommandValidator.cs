using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.CreateOPCR;

public class CreateOPCRCommandValidator : AbstractValidator<CreateOPCRCommand>
{
    public CreateOPCRCommandValidator()
    {
        // OfficeId (Required GUID)
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required and must be a valid, non-empty GUID.");

        // FiscalYearId (Required GUID)
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year ID is required and must be a valid, non-empty GUID.");

        When(x => !string.IsNullOrWhiteSpace(x.Name), () =>
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Name is required when provided.")
                .MinimumLength(3)
                .WithMessage("Name must be at least 3 characters long.")
                .MaximumLength(256)
                .WithMessage("Name cannot exceed 256 characters.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Code), () =>
        {
            RuleFor(x => x.Code)
                .NotEmpty()
                .WithMessage("Code is required when provided.")
                .MinimumLength(3)
                .WithMessage("Code must be at least 3 characters long.")
                .MaximumLength(50)
                .WithMessage("Code cannot exceed 50 characters.");
        });
    }
}
