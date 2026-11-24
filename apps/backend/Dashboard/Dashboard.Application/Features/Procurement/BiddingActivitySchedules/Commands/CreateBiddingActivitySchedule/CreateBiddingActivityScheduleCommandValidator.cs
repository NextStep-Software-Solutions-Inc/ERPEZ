using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.CreateBiddingActivitySchedule;

public class CreateBiddingActivityScheduleCommandValidator : AbstractValidator<CreateBiddingActivityScheduleCommand>
{
    public CreateBiddingActivityScheduleCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.ScheduleRequest.ProcurementActivityTypeId)
            .NotEmpty()
            .WithMessage("Procurement activity type ID is required.");

        RuleFor(x => x.ScheduleRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.");

        RuleFor(x => x.ScheduleRequest.StartDate)
            .NotEmpty()
            .WithMessage("Start date is required.");

        RuleFor(x => x.ScheduleRequest.EndDate)
            .NotEmpty()
            .WithMessage("End date is required.")
            .GreaterThan(x => x.ScheduleRequest.StartDate)
            .WithMessage("End date must be after start date.");

        RuleFor(x => x.ScheduleRequest.Venue)
            .NotEmpty()
            .MaximumLength(500)
            .WithMessage("Venue is required.");
    }
}
