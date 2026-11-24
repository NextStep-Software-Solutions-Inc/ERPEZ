using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardJustification;

public class RecordNoticeOfAwardJustificationCommandValidator : AbstractValidator<RecordNoticeOfAwardJustificationCommand>
{
    public RecordNoticeOfAwardJustificationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Request.Justification)
            .NotEmpty().WithMessage("Justification explanation is required.")
            .MaximumLength(2000).WithMessage("Justification cannot exceed 2000 characters.");
    }
}
