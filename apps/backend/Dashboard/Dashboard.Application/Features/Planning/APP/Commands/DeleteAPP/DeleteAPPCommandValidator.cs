using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APP.Commands.DeleteAPP;

public class DeleteAPPCommandValidator : AbstractValidator<DeleteAPPCommand>
{
    public DeleteAPPCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APP ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("APP ID must be a valid, non-empty GUID.");
    }
}
