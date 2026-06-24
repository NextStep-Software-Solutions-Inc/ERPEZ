using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.BiddingActivitySchedules.Commands.UpdateBiddingActivitySchedule;

public class UpdateBiddingActivityScheduleCommandValidator : AbstractValidator<UpdateBiddingActivityScheduleCommand>
{
    public UpdateBiddingActivityScheduleCommandValidator()
    {
        RuleFor(x => x.ProjectId)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.ScheduleId)
            .NotEmpty()
            .WithMessage("Schedule Id is required.");

        RuleFor(x => x.ScheduleRequest.ProcurementActivityTypeId)
            .NotEmpty()
            .WithMessage("Procurement activity type ID is required.");

        RuleFor(x => x.ScheduleRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.");

        RuleFor(x => x.ScheduleRequest.EndDate)
            .GreaterThan(x => x.ScheduleRequest.StartDate!.Value)
            .When(x => x.ScheduleRequest.StartDate.HasValue && x.ScheduleRequest.EndDate.HasValue)
            .WithMessage("End date must be after start date.");

        RuleFor(x => x.ScheduleRequest.Venue)
            .NotEmpty()
            .MaximumLength(500)
            .WithMessage("Venue is required.");
    }
}
