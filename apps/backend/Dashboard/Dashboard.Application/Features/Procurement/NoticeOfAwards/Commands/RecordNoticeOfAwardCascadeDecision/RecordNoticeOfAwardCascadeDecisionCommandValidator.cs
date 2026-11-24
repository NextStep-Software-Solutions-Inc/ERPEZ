using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.RecordNoticeOfAwardCascadeDecision;

public class RecordNoticeOfAwardCascadeDecisionCommandValidator : AbstractValidator<RecordNoticeOfAwardCascadeDecisionCommand>
{
    public RecordNoticeOfAwardCascadeDecisionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Request.Note)
            .NotEmpty().WithMessage("Cascade decision note is required.")
            .MaximumLength(2000).WithMessage("Cascade note cannot exceed 2000 characters.");
    }
}
