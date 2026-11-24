using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Queries.GetLibRealignmentPdf;

public class GetLibRealignmentPdfQueryValidator : AbstractValidator<GetLibRealignmentPdfQuery>
{
    public GetLibRealignmentPdfQueryValidator()
    {
        RuleFor(x => x.RealignmentId)
            .NotEmpty()
            .WithMessage("Realignment ID is required.");
    }
}
