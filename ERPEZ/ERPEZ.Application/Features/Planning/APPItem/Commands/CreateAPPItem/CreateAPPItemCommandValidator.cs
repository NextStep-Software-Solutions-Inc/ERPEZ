using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;

public class CreateAPPItemCommandValidator : AbstractValidator<CreateAPPItemCommand>
{
    public CreateAPPItemCommandValidator()
    {
        RuleFor(x => x.APPId)
            .NotEmpty()
            .WithMessage("APPId is required.");

        RuleFor(x => x.PPMPItemId)
            .NotEmpty()
            .WithMessage("PPMPItemId is required.");

        RuleFor(x => x.ProcurementModeId)
            .NotEmpty()
            .WithMessage("ProcurementModeId is required.");

        RuleFor(x => x.FundSourceId)
            .NotEmpty()
            .WithMessage("FundSourceId is required.");

        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("OfficeId is required.");

        RuleFor(x => x.PAPCode)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Remarks)
            .MaximumLength(1000);
    }
}
