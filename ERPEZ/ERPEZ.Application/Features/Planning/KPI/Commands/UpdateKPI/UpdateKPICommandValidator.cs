using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();
    private readonly string[] validFunctionTypes = Enum.GetNames<FunctionTypeEnum>();
    private readonly string[] validPeriods = Enum.GetNames<PeriodEnum>();

    public UpdateKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");

        // 4. FunctionType (Optional String?) - Check only if provided
        RuleFor(x => x.FunctionType)
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => validFunctionTypes.Contains(type))
            .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.FunctionType));

        // 5. Name (Optional String?) - Check only if provided
        RuleFor(x => x.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        // 6. Description (Optional String?) - Check only if provided
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Status)
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Status));

        // 8. SDGIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.SDGIds)
            .ForEach(sdgId => sdgId.NotEmpty().WithMessage("SDG ID must be a valid, non-empty GUID."))
            .When(x => x.SDGIds != null && x.SDGIds.Count != 0);

        // 9. KPIRatings (List<CreateKPIRatingRequest>) - Optional for partial update and validation inside
        RuleFor(x => x.KPIRatings)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Ratings list cannot be empty if provided.");

        RuleForEach(x => x.KPIRatings)
            .ChildRules(rating =>
            {
                rating.RuleFor(r => r.PerformanceMeasureId)
                    .NotEmpty()
                    .WithMessage("Performance Measure ID is required for KPI Rating.")
                    .Must(id => id != Guid.Empty)
                    .WithMessage("Performance Measure ID must be a valid, non-empty GUID.");

                rating.RuleFor(r => r.Ratings)
                    .NotNull()
                    .WithMessage("Ratings list cannot be null.")
                    .Must(ratingsList => ratingsList.Count > 0)
                    .WithMessage("At least one rating must be provided.");

                rating.RuleForEach(r => r.Ratings)
                    .ChildRules(numericalRating =>
                    {
                        numericalRating.RuleFor(nr => nr.Value)
                            .GreaterThanOrEqualTo(0)
                            .WithMessage("Numerical Rating value must be non-negative.");
                    });
            });
       
            

        // 10. KPITargets (List<CreateKPITargetRequest>) - Optional for partial update
        RuleFor(x => x.KPITargets)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Targets list cannot be empty if provided.")
            .Must(list => list == null || list.All(target => !string.IsNullOrWhiteSpace(target.Period) && validPeriods.Contains(target.Period, StringComparer.OrdinalIgnoreCase)))
            .WithMessage($"All KPI Targets must have valid periods from: {string.Join(", ", validPeriods)}.");

        RuleForEach(x => x.KPITargets)
            .ChildRules(target =>
            {
                target.RuleFor(t => t.TargetValue)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Target Value must be greater than or equal to zero.");

                target.RuleFor(t => t.QuarterName)
                    .MaximumLength(50)
                    .WithMessage("Quarter Name cannot exceed 50 characters.");
            });

        // 11. KPIMOVs (List<CreateKPIMOVRequest>) - Optional for partial update
        RuleFor(x => x.KPIMOVs)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Mode of Verifications list cannot be empty if provided.");

        RuleForEach(x => x.KPIMOVs)
            .ChildRules(mov =>
            {
                mov.RuleFor(m => m.Name)
                    .NotEmpty()
                    .WithMessage("KPI MOV Name is required.")
                    .MaximumLength(200)
                    .WithMessage("KPI MOV Name cannot exceed 200 characters.");
                    
                mov.RuleFor(m => m.Description)
                    .MinimumLength(10)
                    .WithMessage("KPI MOV Description must be at least 10 characters long.")
                    .MaximumLength(500)
                    .WithMessage("KPI MOV Description cannot exceed 500 characters.")
                    .When(m => !string.IsNullOrWhiteSpace(m.Description));
            });

        // 12. MFOPAPIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.MFOPAPIds)
            .ForEach(mfopapId => mfopapId.NotEmpty()
            .WithMessage("MFOPAP ID must be a valid, non-empty GUID."))
            .When(x => x.MFOPAPIds != null && x.MFOPAPIds.Count != 0);

        // 13. Attributes (List<Guid>) - Optional for partial update
        RuleFor(x => x.AttributeIds)
            .ForEach(attrId => attrId.NotEmpty()
            .WithMessage("Attribute ID must be a valid, non-empty GUID."))
            .When(x => x.AttributeIds != null && x.AttributeIds.Count != 0);

    }
}
