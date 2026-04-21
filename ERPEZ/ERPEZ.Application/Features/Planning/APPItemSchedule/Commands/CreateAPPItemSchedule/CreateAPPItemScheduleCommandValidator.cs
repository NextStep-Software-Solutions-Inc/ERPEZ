using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public class CreateAPPItemScheduleCommandValidator : AbstractValidator<CreateAPPItemScheduleCommand>
{
    public CreateAPPItemScheduleCommandValidator()
    {
        RuleFor(x => x.APPId)
            .NotEmpty()
            .WithMessage("APPId is required.");

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
