using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Commands.DeleteAgencyMasterBudget;

public class DeleteAgencyMasterBudgetCommandValidator : AbstractValidator<DeleteAgencyMasterBudgetCommand>
{
    public DeleteAgencyMasterBudgetCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("{PropertyName} is required.");
    }
}



