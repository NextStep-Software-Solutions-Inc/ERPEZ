using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.DeleteProcurementActivityType;

public class DeleteProcurementActivityTypeCommandValidator : AbstractValidator<DeleteProcurementActivityTypeCommand>
{
    public DeleteProcurementActivityTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement Activity Type ID is required.");
    }
}
