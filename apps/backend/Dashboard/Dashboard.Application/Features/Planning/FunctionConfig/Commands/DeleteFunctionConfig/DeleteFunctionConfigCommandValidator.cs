using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Commands.DeleteFunctionConfig;

public class DeleteFunctionConfigCommandValidator : AbstractValidator<DeleteFunctionConfigCommand>
{
    public DeleteFunctionConfigCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Function Config Id is required.");
    }
}
