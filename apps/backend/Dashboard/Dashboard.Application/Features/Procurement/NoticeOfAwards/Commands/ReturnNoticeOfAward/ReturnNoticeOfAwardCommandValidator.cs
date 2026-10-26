using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ReturnNoticeOfAward;

public class ReturnNoticeOfAwardCommandValidator : AbstractValidator<ReturnNoticeOfAwardCommand>
{
    public ReturnNoticeOfAwardCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Request.Remarks)
            .NotEmpty().WithMessage("Return remarks are required.")
            .MaximumLength(1000).WithMessage("Remarks cannot exceed 1000 characters.");
    }
}
