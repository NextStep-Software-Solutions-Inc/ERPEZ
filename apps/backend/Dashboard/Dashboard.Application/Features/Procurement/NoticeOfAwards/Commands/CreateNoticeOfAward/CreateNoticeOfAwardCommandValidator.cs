using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;

public class CreateNoticeOfAwardCommandValidator : AbstractValidator<CreateNoticeOfAwardCommand>
{
    public CreateNoticeOfAwardCommandValidator()
    {
        RuleFor(x => x.Request.BacResolutionId)
            .NotEmpty().WithMessage("BAC Resolution is required.");

        RuleFor(x => x.Request.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
    }
}
