using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;

/// <summary>
/// Validator for DeleteTenantCommand ensuring the tenant ID is valid.
/// </summary>
public class DeleteTenantCommandValidator : AbstractValidator<DeleteTenantCommand>
{
    public DeleteTenantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Tenant ID is required.");
    }
}
