using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreatePPMP;

public class CreatePPMPCommandValidator : AbstractValidator<CreatePPMPCommand>
{
    public CreatePPMPCommandValidator()
    {
        RuleFor(x => x.PPMPNumber)
            .NotEmpty()
            .WithMessage("PPMP Number is required.")
            .MaximumLength(50)
            .WithMessage("PPMP Number cannot exceed 50 characters.");

        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year ID is required.");

        RuleFor(x => x.FundSourceId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Fund Source ID must be a valid, non-empty GUID.")
            .When(x => x.FundSourceId.HasValue);

        RuleFor(x => x.LIBId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the LIB ID must be a valid, non-empty GUID.")
            .When(x => x.LIBId.HasValue);

        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.ParentId.HasValue);
    }
}
