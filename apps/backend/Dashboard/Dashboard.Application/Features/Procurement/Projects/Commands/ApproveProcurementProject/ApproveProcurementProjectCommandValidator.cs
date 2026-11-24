using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.ApproveProcurementProject;

public class ApproveProcurementProjectCommandValidator : AbstractValidator<ApproveProcurementProjectCommand>
{
    public ApproveProcurementProjectCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty().WithMessage("Project ID is required.");

        RuleFor(x => x.Request).NotNull().WithMessage("Request body is required.");

        When(x => x.Request != null, () =>
        {
            RuleFor(x => x.Request.AttachmentFileId)
                .NotEmpty().WithMessage("Attachment File ID is required.");
        });
    }
}
