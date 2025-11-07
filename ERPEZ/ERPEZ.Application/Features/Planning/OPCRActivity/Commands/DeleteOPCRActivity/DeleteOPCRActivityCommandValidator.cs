using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.DeleteOPCRActivity;

public class DeleteOPCRActivityCommandValidator : AbstractValidator<DeleteOPCRActivityCommand>
{
    public DeleteOPCRActivityCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR Activity ID must be a valid, non-empty GUID.");
    }
}