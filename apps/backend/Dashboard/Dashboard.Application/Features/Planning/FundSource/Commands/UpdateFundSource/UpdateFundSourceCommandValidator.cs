using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.UpdateFundSource;

public class UpdateFundSourceCommandValidator : AbstractValidator<UpdateFundSourceCommand>
{
    private readonly string[] validTypes =
    [
        "FundCluster", "FinancingSource", "AuthorizationCode", "FundCategory"
    ];

    public UpdateFundSourceCommandValidator()
    {
        // Primary ID — always required
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fund Source ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Fund Source ID must be a valid, non-empty GUID.");

        // ParentId — validate only when provided
        RuleFor(x => x.UpdateFundSource.ParentId)
            .Must(id => id!.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .NotEqual(x => (Guid?)x.Id)
            .WithMessage("A Fund Source cannot be its own parent.")
            .When(x => x.UpdateFundSource.ParentId.HasValue);

        // Name — validate only when provided
        RuleFor(x => x.UpdateFundSource.Name)
            .NotEmpty()
            .WithMessage("Fund Source Name is required.")
            .MinimumLength(3)
            .WithMessage("Fund Source Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Fund Source Name cannot exceed 150 characters.")
            .When(x => x.UpdateFundSource.Name is not null);

        // Code — validate only when provided
        RuleFor(x => x.UpdateFundSource.Code)
            .NotEmpty()
            .WithMessage("Fund Source Code is required.")
            .MinimumLength(2)
            .WithMessage("Fund Source Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Fund Source Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Fund Source Code can only contain letters, numbers, hyphens, and underscores.")
            .When(x => x.UpdateFundSource.Code is not null);

        // Type — validate only when provided
        RuleFor(x => x.UpdateFundSource.Type)
            .NotEmpty()
            .WithMessage("Fund Source Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Fund Source Type must be one of the following: {string.Join(", ", validTypes)}.")
            .When(x => x.UpdateFundSource.Type is not null);

        // FiscalYearId — validate only when provided
        RuleFor(x => x.UpdateFundSource.FiscalYearId)
            .Must(id => id!.Value != Guid.Empty)
            .WithMessage("If provided, the Fiscal Year ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateFundSource.FiscalYearId.HasValue);
    }
}