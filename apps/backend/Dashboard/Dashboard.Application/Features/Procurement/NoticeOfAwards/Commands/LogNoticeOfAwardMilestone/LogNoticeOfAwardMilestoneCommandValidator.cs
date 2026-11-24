using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;

public class LogNoticeOfAwardMilestoneCommandValidator : AbstractValidator<LogNoticeOfAwardMilestoneCommand>
{
    public LogNoticeOfAwardMilestoneCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}
