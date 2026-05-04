using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;

public class UpdateAPPItemCommandValidator : AbstractValidator<UpdateAPPItemCommand>
{
    public UpdateAPPItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

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
            .WithMessage("PAPCode is required.")
            .MaximumLength(100)
            .WithMessage("PAPCode must not exceed 100 characters.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks must not exceed 1000 characters.");
            
        RuleFor(x => x.ProcurementStrategy)
            .MaximumLength(1000)
            .WithMessage("ProcurementStrategy must not exceed 1000 characters.");
    }
}
