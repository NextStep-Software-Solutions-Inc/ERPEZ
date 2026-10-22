using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.DeleteProcurementItem;

public class DeleteProcurementItemCommandValidator : AbstractValidator<DeleteProcurementItemCommand>
{
    public DeleteProcurementItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement item ID is required for deletion.");
    }
}
