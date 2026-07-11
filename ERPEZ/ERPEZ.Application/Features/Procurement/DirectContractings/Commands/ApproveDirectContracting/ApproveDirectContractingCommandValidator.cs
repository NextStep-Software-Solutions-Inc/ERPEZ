using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ApproveDirectContracting;

public class ApproveDirectContractingCommandValidator : AbstractValidator<ApproveDirectContractingCommand>
{
    public ApproveDirectContractingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Direct Contracting ID is required.");

        RuleFor(x => x.Request).NotNull().WithMessage("Request body is required.");

        When(x => x.Request != null, () =>
        {
            RuleFor(x => x.Request.AttachmentFileId)
                .NotEmpty().WithMessage("Attachment File ID is required.");
        });
    }
}
