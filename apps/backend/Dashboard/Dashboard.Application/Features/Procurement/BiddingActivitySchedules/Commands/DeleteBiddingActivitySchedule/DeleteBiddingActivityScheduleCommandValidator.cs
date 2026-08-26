using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.DeleteBiddingActivitySchedule;

public class DeleteBiddingActivityScheduleCommandValidator : AbstractValidator<DeleteBiddingActivityScheduleCommand>
{
    public DeleteBiddingActivityScheduleCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.ScheduleId)
            .NotEmpty()
            .WithMessage("Schedule Id is required.");
    }
}
