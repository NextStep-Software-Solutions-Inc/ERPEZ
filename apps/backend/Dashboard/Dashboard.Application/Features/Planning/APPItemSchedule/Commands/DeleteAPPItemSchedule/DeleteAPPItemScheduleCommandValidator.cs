using FluentValidation;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.DeleteAPPItemSchedule;

public class DeleteAPPItemScheduleCommandValidator : AbstractValidator<DeleteAPPItemScheduleCommand>
{
    public DeleteAPPItemScheduleCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("APP item schedule ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("APP item schedule ID must be a valid, non-empty GUID.");
    }
}
