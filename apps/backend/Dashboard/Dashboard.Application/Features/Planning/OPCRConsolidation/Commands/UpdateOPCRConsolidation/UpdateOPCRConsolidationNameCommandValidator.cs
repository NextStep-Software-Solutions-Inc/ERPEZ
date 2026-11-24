// UpdateOPCRConsolidationNameCommandValidator.cs
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Commands.UpdateOPCRConsolidation;

public class UpdateOPCRConsolidationNameCommandValidator
    : AbstractValidator<UpdateOPCRConsolidationNameCommand>
{
    public UpdateOPCRConsolidationNameCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Consolidation ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Consolidation ID must be a valid, non-empty GUID.");

        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(3)
            .WithMessage("Name must be at least 3 characters.")
            .MaximumLength(256)
            .WithMessage("Name cannot exceed 256 characters.");
    }
}