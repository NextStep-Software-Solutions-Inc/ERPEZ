using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.DeleteProcurementCategory;

public class DeleteProcurementCategoryCommandValidator : AbstractValidator<DeleteProcurementCategoryCommand>
{
    public DeleteProcurementCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement category ID is required for deletion.");
    }
}
