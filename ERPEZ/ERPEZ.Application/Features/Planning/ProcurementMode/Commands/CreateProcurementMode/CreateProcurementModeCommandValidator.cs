using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.CreateProcurementMode;

public class CreateProcurementModeCommandValidator : AbstractValidator<CreateProcurementModeCommand>
{
    public CreateProcurementModeCommandValidator()
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

        RuleFor(x => x.ProcurementCategoryId)
            .NotEmpty()
            .WithMessage("Procurement category is required.");
    }
}
