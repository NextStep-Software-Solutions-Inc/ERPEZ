using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public class CreateAPPItemScheduleCommandValidator : AbstractValidator<CreateAPPItemScheduleCommand>
{
    public CreateAPPItemScheduleCommandValidator()
    {
        RuleFor(x => x.APPItemId)
            .NotEmpty()
            .WithMessage("APPItemId is required.");

        RuleFor(x => x.ProcurementActivityTypeId)
            .NotEmpty()
            .WithMessage("ProcurementActivityTypeId is required.");
            
        RuleFor(x => x.ScheduledDate)
            .NotEmpty()
            .When(x => string.IsNullOrWhiteSpace(x.CustomDateText))
            .WithMessage("Either ScheduledDate or CustomDateText must be provided.");

        RuleFor(x => x.CustomDateText)
            .NotEmpty()
            .When(x => x.ScheduledDate == null)
            .WithMessage("Either ScheduledDate or CustomDateText must be provided.");
    }
}
