using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;

public class ApproveNoticeOfAwardCommandValidator : AbstractValidator<ApproveNoticeOfAwardCommand>
{
    public ApproveNoticeOfAwardCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
