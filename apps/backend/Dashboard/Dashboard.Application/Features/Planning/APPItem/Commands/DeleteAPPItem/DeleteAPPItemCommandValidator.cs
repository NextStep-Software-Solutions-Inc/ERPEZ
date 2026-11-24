using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.DeleteAPPItem;

public class DeleteAPPItemCommandValidator : AbstractValidator<DeleteAPPItemCommand>
{
    public DeleteAPPItemCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APP item ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("APP item ID must be a valid, non-empty GUID.");
    }
}
