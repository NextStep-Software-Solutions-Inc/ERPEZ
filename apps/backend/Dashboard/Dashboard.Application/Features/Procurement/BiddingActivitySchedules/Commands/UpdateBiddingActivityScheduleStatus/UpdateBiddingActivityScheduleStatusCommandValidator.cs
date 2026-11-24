using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivityScheduleStatus;

public class UpdateBiddingActivityScheduleStatusCommandValidator : AbstractValidator<UpdateBiddingActivityScheduleStatusCommand>
{
    public UpdateBiddingActivityScheduleStatusCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.ScheduleId)
            .NotEmpty()
            .WithMessage("Schedule Id is required.");

        RuleFor(x => x.StatusRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.");
    }
}
