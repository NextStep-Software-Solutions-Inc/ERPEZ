using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.CreateProcurementCategory;

public class CreateProcurementCategoryCommandValidator : AbstractValidator<CreateProcurementCategoryCommand>
{
    public CreateProcurementCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
