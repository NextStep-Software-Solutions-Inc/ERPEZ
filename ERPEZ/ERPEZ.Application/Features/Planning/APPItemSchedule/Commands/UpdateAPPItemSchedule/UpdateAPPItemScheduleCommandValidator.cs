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
            .WithMessage("ScheduledDate is required.");
    }
}
