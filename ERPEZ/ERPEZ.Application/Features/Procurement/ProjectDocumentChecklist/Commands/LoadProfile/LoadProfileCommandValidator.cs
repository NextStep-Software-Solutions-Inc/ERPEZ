using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ProjectDocumentChecklist.Commands.LoadProfile;

public class LoadProfileCommandValidator : AbstractValidator<LoadProfileCommand>
{
    public LoadProfileCommandValidator()
    {
        RuleFor(x => x.ProcurementProjectId).NotEmpty();
        RuleFor(x => x.DocumentProfileId).NotEmpty();
    }
}