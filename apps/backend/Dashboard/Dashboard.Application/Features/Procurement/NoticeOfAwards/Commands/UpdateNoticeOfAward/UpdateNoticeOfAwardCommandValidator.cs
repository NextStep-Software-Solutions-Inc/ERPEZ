using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.UpdateNoticeOfAward;

public class UpdateNoticeOfAwardCommandValidator : AbstractValidator<UpdateNoticeOfAwardCommand>
{
    public UpdateNoticeOfAwardCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Request.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
    }
}
