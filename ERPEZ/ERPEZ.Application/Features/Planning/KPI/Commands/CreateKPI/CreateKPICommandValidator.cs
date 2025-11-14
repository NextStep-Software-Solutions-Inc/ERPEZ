using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Constants;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
{
    // NOTE: You must also ensure that the validators for the nested request types (e.g., CreateKPIRatingRequestValidator) 
    // are defined and available in your application for the SetValidator calls to work correctly.

    public CreateKPICommandValidator(
        IValidator<CreateSDGRequest> sdgValidator,
        IValidator<CreateKPIRatingRequest> kpiRatingValidator,
        IValidator<CreateKPITargetRequest> kpiTargetValidator,
        IValidator<CreateKPIModeOfVerificationRequest> kpiModeOfVerificationValidator,
        IValidator<CreateMFOKPIRequest> mfoKpiValidator,
        IValidator<CreateKPIAttributeRequest> kpiAttributeValidator)
    {
        // ParentKPIId (Optional GUID)
        RuleFor(x => x.ParentKPIId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
            .When(x => x.ParentKPIId.HasValue);

        // FunctionType (Required String, Valid Value)
        RuleFor(x => x.FunctionType)
            .NotEmpty()
            .WithMessage("Function Type is required.")
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => FunctionTypeConstants.validFunctionTypes.Contains(type))
            .WithMessage($"FunctionType must be one of: {string.Join(", ", FunctionTypeConstants.validFunctionTypes)}.");

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("KPI Name is required.")
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // Required Booleans
        RuleFor(x => x.IsOfficeMandate)
            .NotNull()
            .WithMessage("Is Office Mandate must be provided (true or false).");

        RuleFor(x => x.IsPercentage)
            .NotNull()
            .WithMessage("Is Percentage must be provided (true or false).");

        // --- Nested Property Validations ---

        // SDGs (List)
        RuleFor(x => x.SDGs)
            .NotEmpty()
            .WithMessage("At least one SDG must be provided.")
            .Must(list => list.Count <= 5)
            .WithMessage("A KPI cannot be linked to more than 5 SDGs.");
        RuleForEach(x => x.SDGs).SetValidator(sdgValidator);

        // KPIRatings (List)
        RuleFor(x => x.KPIRatings)
            .NotEmpty()
            .WithMessage("At least one KPI Rating must be provided.");
        RuleForEach(x => x.KPIRatings).SetValidator(kpiRatingValidator);

        // KPITarget (Single Object)
        RuleFor(x => x.KPITarget)
            .NotNull()
            .WithMessage("KPI Target is required.");
        RuleFor(x => x.KPITarget).SetValidator(kpiTargetValidator);

        // KPIModeOfVerifications (List)
        RuleFor(x => x.KPIModeOfVerifications)
            .NotEmpty()
            .WithMessage("At least one KPI Mode of Verification must be provided.");
        RuleForEach(x => x.KPIModeOfVerifications).SetValidator(kpiModeOfVerificationValidator);

        // MFOKPIs (List)
        RuleFor(x => x.MFOKPIs)
            .NotEmpty()
            .WithMessage("At least one MFOKPI link must be provided.");
        RuleForEach(x => x.MFOKPIs).SetValidator(mfoKpiValidator);

        // KPIAttribute (List)
        RuleFor(x => x.KPIAttribute)
            .NotEmpty()
            .WithMessage("At least one KPI Attribute must be provided.");
        RuleForEach(x => x.KPIAttribute).SetValidator(kpiAttributeValidator);
    }
}
