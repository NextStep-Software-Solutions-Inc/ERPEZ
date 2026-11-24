using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Modules.Commands.DeleteModule;

/// <summary>
/// Validator for DeleteModuleCommand ensuring the module ID is valid.
/// </summary>
public class DeleteModuleCommandValidator : AbstractValidator<DeleteModuleCommand>
{
    public DeleteModuleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Module ID is required.");
    }
}
