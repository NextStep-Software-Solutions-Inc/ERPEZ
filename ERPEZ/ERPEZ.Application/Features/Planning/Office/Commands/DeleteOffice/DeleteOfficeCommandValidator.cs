using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.DeleteOffice;

public class DeleteOfficeCommandValidator : AbstractValidator<DeleteOfficeCommand>
{
    public DeleteOfficeCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Office ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Office ID must be a valid, non-empty GUID.");
    }
}