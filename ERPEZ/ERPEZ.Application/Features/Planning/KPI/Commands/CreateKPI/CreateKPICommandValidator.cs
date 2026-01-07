using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
{
    private readonly string[] validFunctionTypes = Enum.GetNames<FunctionTypeEnum>();
    private readonly string[] validPeriods = Enum.GetNames<PeriodEnum>();

    public CreateKPICommandValidator()
    {
        RuleFor(x => x.ParentKPIId)
        .Must(id => !id.HasValue || id.Value != Guid.Empty)
        .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
        .When(x => x.ParentKPIId.HasValue);

        RuleFor(x => x.FunctionType)
                .NotEmpty()
                .WithMessage("Function Type is required.")
                .MaximumLength(100)
                .WithMessage("Function Type cannot exceed 100 characters.")
                .Must(type => validFunctionTypes.Contains(type))
                .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.");

        RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("KPI Name is required.")
                .MinimumLength(5)
                .WithMessage("KPI Name must be at least 5 characters long.")
                .MaximumLength(250)
                .WithMessage("KPI Name cannot exceed 250 characters.");


        RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage("Description cannot exceed 1000 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.IsOfficeMandate)
                .NotNull()
                .WithMessage("Is Office Mandate must be provided (true or false).");


        RuleFor(x => x.IsPercentage)
                .NotNull()
                .WithMessage("Is Percentage must be provided (true or false).");

        RuleFor(x => x.IsTargetValueAllocable)
                .NotNull()
                .WithMessage("Is Target Value Allocable must be provided (true or false).");

        RuleFor(x => x.IsFixed)
                .NotNull()
                .WithMessage("Is Fixed must be provided (true or false).");

        RuleFor(x => x.IsGlobal)
                .NotNull()
                .WithMessage("Is Global must be provided (true or false).");

        RuleFor(x => x.IsMultiple)
                .NotNull()
                .WithMessage("Is Multiple must be provided (true or false).");

        RuleFor(x => x.IsAverage)
                .NotNull()
                .WithMessage("Is Average must be provided (true or false).");

        RuleForEach(x => x.SDGIds)
                .NotEmpty()
                .WithMessage("SDG ID cannot be empty.");

        RuleFor(x => x.KPITargets)
                .NotNull()
                .WithMessage("KPI Targets is required.")
                .Must(targets => targets.Count > 0)
                .WithMessage("At least one KPI Target must be provided.");

        RuleForEach(x => x.KPITargets)
                .ChildRules(target =>
                {
                    target.RuleFor(t => t.Period)
                        .NotEmpty()
                        .WithMessage("KPI Target Period is required.")
                        .MaximumLength(50)
                        .WithMessage("KPI Target Period cannot exceed 50 characters.")
                        .Must(period => validPeriods.Contains(period))
                        .WithMessage($"Period must be one of: {string.Join(", ", validPeriods)}.");

                    target.RuleFor(t => t.TargetValue)
                        .GreaterThanOrEqualTo(0)
                        .WithMessage("KPI Target Value must be greater than or equal to 0.");

                    target.RuleFor(t => t.QuarterName)
                        .MaximumLength(100)
                        .WithMessage("KPI Target Quarter Name cannot exceed 100 characters.")
                        .When(t => !string.IsNullOrWhiteSpace(t.QuarterName));
                });

        // Additional validation: If more than one target, at least one must be greater than 0
        RuleFor(x => x.KPITargets)
            .Must(targets => targets.Count <= 1 || targets.Any(t => t.TargetValue > 0))
            .WithMessage("When multiple KPI targets are provided, at least one target value must be greater than 0.")
            .When(x => x.KPITargets != null && x.KPITargets.Count > 0);

        RuleFor(x => x.KPIRatings)
                .NotNull()
                .WithMessage("KPI Ratings is required.")
                .Must(ratings => ratings.Count > 0)
                .WithMessage("At least one KPI Rating must be provided.");

        RuleForEach(x => x.KPIRatings)
                .ChildRules(rating =>
                {
                    rating.RuleFor(r => r.PerformanceMeasureId)
                        .NotEmpty()
                        .WithMessage("Performance Measure ID is required for KPI Rating.");

                    rating.RuleFor(r => r.Ratings)
                        .NotNull()
                        .WithMessage("Ratings collection is required for KPI Rating.")
                        .Must(r => r.Count > 0)
                        .WithMessage("At least one rating value must be provided.");

                    rating.RuleForEach(r => r.Ratings)
                        .ChildRules(numericalRating =>
                        {
                            numericalRating.RuleFor(nr => nr.Value)
                                .InclusiveBetween(1, 5)
                                .WithMessage("Numerical rating value must be between 1 and 5.");

                            numericalRating.RuleFor(nr => nr.Remarks)
                                .MaximumLength(500)
                                .WithMessage("Rating remarks cannot exceed 500 characters.")
                                .When(nr => !string.IsNullOrWhiteSpace(nr.Remarks));
                        });
                });

        RuleFor(x => x.KPIRatings)
                .Must(ratings => ratings.Select(r => r.PerformanceMeasureId).Distinct().Count() == ratings.Count)
                .WithMessage("PerformanceMeasureId must be unique across all KPI Ratings.")
                .When(x => x.KPIRatings != null && x.KPIRatings.Count != 0);

        RuleFor(x => x.KPIMOVs)
                .NotNull()
                .WithMessage("KPI Mode of Verifications is required.")
                .Must(movs => movs.Count > 0)
                .WithMessage("At least one KPI Mode of Verification must be provided.");

        RuleForEach(x => x.KPIMOVs)
                .ChildRules(mov =>
                {
                    mov.RuleFor(m => m.Name)
                        .NotEmpty()
                        .WithMessage("KPI MOV Name is required.")
                        .MinimumLength(3)
                        .WithMessage("KPI MOV Name must be at least 3 characters long.")
                        .MaximumLength(200)
                        .WithMessage("KPI MOV Name cannot exceed 200 characters.");

                    mov.RuleFor(m => m.Description)
                        .MaximumLength(1000)
                        .WithMessage("KPI MOV Description cannot exceed 1000 characters.")
                        .When(m => !string.IsNullOrWhiteSpace(m.Description));

                    mov.RuleFor(m => m.FileId)
                        .Must(id => !id.HasValue || id.Value != Guid.Empty)
                        .WithMessage("If provided, the File ID must be a valid, non-empty GUID.")
                        .When(m => m.FileId.HasValue);
                });

        RuleForEach(x => x.AttributeIds)
                .NotEmpty()
                .WithMessage("Attribute ID cannot be empty.");

        RuleFor(x => x.MFOPAPId)
                .Must(id => !id.HasValue || id.Value != Guid.Empty)
                .WithMessage("If provided, the MFOPAP ID must be a valid, non-empty GUID.")
                .When(x => x.MFOPAPId.HasValue);
    }
}
