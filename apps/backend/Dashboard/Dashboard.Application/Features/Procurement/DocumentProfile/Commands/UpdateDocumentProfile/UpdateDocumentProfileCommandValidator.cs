using ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.UpdateDocumentProfile;

public class UpdateDocumentProfileCommandValidator
    : AbstractValidator<UpdateDocumentProfileCommand>
{
    public UpdateDocumentProfileCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ProcurementCategory).NotEmpty().MaximumLength(100);
        RuleForEach(x => x.Items).ChildRules(item =>
            item.RuleFor(i => i.MasterDocumentTypeId).NotEmpty());
    }
}