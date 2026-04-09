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
        // Primary ID Validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fund Source ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Fund Source ID must be a valid, non-empty GUID.");

        // ParentId (Optional GUID)
        RuleFor(x => x.UpdateFundSource.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateFundSource.ParentId.HasValue);

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateFundSource.Name)
            .NotEmpty()
            .WithMessage("Fund Source Name is required.")
            .MinimumLength(3)
            .WithMessage("Fund Source Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Fund Source Name cannot exceed 150 characters.");

        // Code (Required String, Length, Alpha-Numeric with Hyphen/Underscore)
        RuleFor(x => x.UpdateFundSource.Code)
            .NotEmpty()
            .WithMessage("Fund Source Code is required.")
            .MinimumLength(2)
            .WithMessage("Fund Source Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Fund Source Code cannot exceed 20 characters.")
            .Matches(@"^[a-zA-Z0-9\-_]+$")
            .WithMessage("Fund Source Code can only contain letters, numbers, hyphens, and underscores.");

        // Type (Required String, Must be one of the defined valid types)
        RuleFor(x => x.UpdateFundSource.Type)
            .NotEmpty()
            .WithMessage("Fund Source Type is required.")
            .Must(type => validTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Fund Source Type must be one of the following: {string.Join(", ", validTypes)}.");

        // Self-Parenting Check
        RuleFor(x => x.UpdateFundSource.ParentId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateFundSource.ParentId.HasValue)
            .WithMessage("A Fund Source cannot be its own parent.");

        // FiscalYearId (Optional GUID)
        RuleFor(x => x.UpdateFundSource.FiscalYearId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Fiscal Year ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateFundSource.FiscalYearId.HasValue);
    }
}
