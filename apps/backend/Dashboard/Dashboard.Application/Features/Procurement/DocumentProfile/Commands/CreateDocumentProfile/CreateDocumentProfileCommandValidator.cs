using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.CreateDocumentProfile;

public class CreateDocumentProfileCommandValidator
    : AbstractValidator<CreateDocumentProfileCommand>
{
    public CreateDocumentProfileCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ProcurementCategory).NotEmpty().MaximumLength(100);
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.MasterDocumentTypeId)
                .NotEmpty().WithMessage("Each item must reference a valid MasterDocumentTypeId.");
            item.RuleFor(i => i.OrderIndex)
                .GreaterThanOrEqualTo(0).WithMessage("OrderIndex must be non-negative.");
        });
    }
}