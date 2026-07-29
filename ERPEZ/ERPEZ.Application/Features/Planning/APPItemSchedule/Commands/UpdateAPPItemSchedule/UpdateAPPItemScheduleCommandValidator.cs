using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.UpdateAPPItemSchedule;

public class UpdateAPPItemScheduleCommandValidator : AbstractValidator<UpdateAPPItemScheduleCommand>
{
    public UpdateAPPItemScheduleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");
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
