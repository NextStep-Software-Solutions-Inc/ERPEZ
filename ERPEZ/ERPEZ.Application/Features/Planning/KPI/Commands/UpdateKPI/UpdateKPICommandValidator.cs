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
        RuleFor(x => x.Dto.FunctionType)
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => validFunctionTypes.Contains(type))
            .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.FunctionType));

        // 5. Name (Optional String?) - Check only if provided
        RuleFor(x => x.Dto.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        // 6. Description (Optional String?) - Check only if provided
        RuleFor(x => x.Dto.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.Description));

        RuleFor(x => x.Dto.Status)
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.Dto.Status));

        // 8. SDGIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.Dto.SDGIds)
            .ForEach(sdgId => sdgId.NotEmpty().WithMessage("SDG ID must be a valid, non-empty GUID."))
            .When(x => x.Dto.SDGIds != null && x.Dto.SDGIds.Count != 0);

        // 9. KPIRatings (List<UpsertRatingRequest>) - Optional for partial update
        RuleFor(x => x.Dto.KPIRatings)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Ratings list cannot be empty if provided.");

        RuleForEach(x => x.Dto.KPIRatings)
            .ChildRules(rating =>
            {
                rating.RuleFor(r => r.PerformanceMeasureId)
                    .NotEmpty()
                    .WithMessage("Performance Measure ID is required for KPI Rating.")
                    .Must(id => id != Guid.Empty)
                    .WithMessage("Performance Measure ID must be a valid, non-empty GUID.");

                rating.RuleFor(r => r.NumericalRating)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Numerical Rating value must be non-negative.");
            });
        
        // PerformanceMeasureId + NumericalRating uniqueness check
        When(x => x.Dto.KPIRatings != null && x.Dto.KPIRatings.Count != 0, () =>
        {
            RuleFor(x => x.Dto.KPIRatings)
                .Must(ratings => ratings!.Select(r => new { r.PerformanceMeasureId, r.NumericalRating }).Distinct().Count() == ratings!.Count)
                .WithMessage("Combination of PerformanceMeasureId and NumericalRating must be unique across all KPI Ratings.");
        });

        // 10. KPITargets (List<UpsertKPITargetRequest>) - Optional for partial update
        RuleFor(x => x.Dto.KPITargets)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Targets list cannot be empty if provided.");
            

        RuleForEach(x => x.Dto.KPITargets)
            .ChildRules(target =>
            {
                target.RuleFor(t => t.Period)
                    .NotEmpty()
                    .WithMessage("KPI Target Period is required.")
                    .Must(period => validPeriods.Contains(period))
                    .WithMessage($"KPI Target Period must be one of: {string.Join(", ", validPeriods)}.");

                target.RuleFor(t => t.TargetValue)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Target Value must be greater than or equal to zero.");

                target.RuleFor(t => t.QuarterName)
                    .MaximumLength(50)
                    .WithMessage("Quarter Name cannot exceed 50 characters.");
            });

        // 11. KPIMOVs (List<UpsertKPIMOVRequest>) - Optional for partial update
        RuleFor(x => x.Dto.KPIMOVs)
            .Must(list => list == null || list.Count > 0)
            .WithMessage("KPI Mode of Verifications list cannot be empty if provided.");

        RuleForEach(x => x.Dto.KPIMOVs)
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
                    .When(m => !string.IsNullOrWhiteSpace(m.Description))
                    .MaximumLength(500)
                    .WithMessage("KPI MOV Description cannot exceed 500 characters.")
                    .When(m => !string.IsNullOrWhiteSpace(m.Description));
            });

        // 12. MFOPAPIds (List<Guid>) - Optional for partial update
        RuleFor(x => x.Dto.MFOPAPIds)
            .ForEach(mfopapId => mfopapId.NotEmpty()
            .WithMessage("MFOPAP ID must be a valid, non-empty GUID."))
            .When(x => x.Dto.MFOPAPIds != null && x.Dto.MFOPAPIds.Count != 0);

        // 13. Attributes (List<Guid>) - Optional for partial update
        RuleFor(x => x.Dto.AttributeIds)
            .ForEach(attrId => attrId.NotEmpty()
            .WithMessage("Attribute ID must be a valid, non-empty GUID."))
            .When(x => x.Dto.AttributeIds != null && x.Dto.AttributeIds.Count != 0);

    }
}
