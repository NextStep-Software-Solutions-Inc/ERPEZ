using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.UpdateFunctionConfig;

public class UpdateFunctionConfigCommandValidator : AbstractValidator<UpdateFunctionConfigCommand>
{
    public UpdateFunctionConfigCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Function Configuration Id is required.");

        RuleFor(x => x.StrategicMinWeight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Strategic Min Weight must be greater than or equal to 0.");

        RuleFor(x => x.StrategicMaxWeight)
            .GreaterThanOrEqualTo(x => x.StrategicMinWeight)
            .When(x => x.StrategicMaxWeight.HasValue)
            .WithMessage("Strategic Max Weight must be greater than or equal to Min Weight.");

        RuleFor(x => x.CoreFunctionMinWeight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Core Function Min Weight must be greater than or equal to 0.");

        RuleFor(x => x.CoreFunctionMaxWeight)
            .GreaterThanOrEqualTo(x => x.CoreFunctionMinWeight)
            .When(x => x.CoreFunctionMaxWeight.HasValue)
            .WithMessage("Core Function Max Weight must be greater than or equal to Min Weight.");

        RuleFor(x => x.SupportMinWeight)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Support Min Weight must be greater than or equal to 0.");

        RuleFor(x => x.SupportMaxWeight)
            .GreaterThanOrEqualTo(x => x.SupportMinWeight)
            .When(x => x.SupportMaxWeight.HasValue)
            .WithMessage("Support Max Weight must be greater than or equal to Min Weight.");
    }
}
