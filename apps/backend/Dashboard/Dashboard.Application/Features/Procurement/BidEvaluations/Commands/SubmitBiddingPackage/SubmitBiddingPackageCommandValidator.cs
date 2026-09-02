using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;

public class SubmitBiddingPackageCommandValidator : AbstractValidator<SubmitBiddingPackageCommand>
{
    public SubmitBiddingPackageCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request.SupplierId)
            .NotEmpty().WithMessage("Supplier ID is required.");

        RuleFor(x => x.Request.OriginalProposedAmount)
            .GreaterThan(0).WithMessage("Original proposed bid amount must be greater than 0.");

        RuleFor(x => x.Request.BidSecurityType)
            .NotEmpty().WithMessage("Bid security type is required.");
    }
}
