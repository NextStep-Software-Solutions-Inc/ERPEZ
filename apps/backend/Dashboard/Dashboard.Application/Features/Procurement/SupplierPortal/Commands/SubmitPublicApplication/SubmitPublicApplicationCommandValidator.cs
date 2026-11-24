using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Commands.SubmitPublicApplication;

public class SubmitPublicApplicationCommandValidator
    : AbstractValidator<SubmitPublicApplicationCommand>
{
    public SubmitPublicApplicationCommandValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required.")
            .MaximumLength(300);

        RuleFor(x => x.ContactPerson)
            .NotEmpty().WithMessage("Contact person is required.")
            .MaximumLength(200);

        RuleFor(x => x.EmailAddress)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.ContactNumber)
            .NotEmpty().WithMessage("Contact number is required.")
            .MaximumLength(20);

        RuleFor(x => x.TinNumber)
            .NotEmpty().WithMessage("TIN number is required.")
            .MaximumLength(20);

        RuleFor(x => x.BusinessAddress)
            .NotEmpty().WithMessage("Business address is required.")
            .MaximumLength(500);

        RuleFor(x => x.Documents)
            .NotEmpty().WithMessage("At least one document must be submitted.");

        RuleForEach(x => x.Documents).ChildRules(doc =>
        {
            doc.RuleFor(d => d.ChecklistItemId)
                .NotEmpty().WithMessage("ChecklistItemId is required for each document.");

            doc.RuleFor(d => d.FileId)
                .NotEmpty().WithMessage("FileId is required for each document.");
        });
    }
}
