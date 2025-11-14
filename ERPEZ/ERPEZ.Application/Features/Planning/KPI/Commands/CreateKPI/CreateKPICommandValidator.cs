using ERPEZ.Domain.Constants;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

    public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
    {
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
                     .Must(type => FunctionTypeConstants.validFunctionTypes.Contains(type))
                     .WithMessage($"FunctionType must be one of: {string.Join(", ", FunctionTypeConstants.validFunctionTypes)}.");

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

            RuleForEach(x => x.SDGs)
                    .ChildRules(sdg => {
                        sdg.RuleFor(s => s.Name).NotEmpty().MaximumLength(200);
                    });

            RuleFor(x => x.KPITargets)
                    .NotNull()
                    .WithMessage("KPI Target is required.");

            RuleFor(x => x.KPIAttributes)
                    .NotNull()
                    .WithMessage("KPI Attribute is required.");

            RuleFor(x => x.KPIModeOfVerifications)
                    .NotNull()
                    .WithMessage("KPI Mode of Verifications is required.");

            RuleFor(x => x.KPIRatings)
                    .NotNull()
                    .WithMessage("KPI Ratings is required.");

            RuleFor(x => x.MFOKPIs)
                    .NotNull()
                    .WithMessage("MFOKPI is required.");
        }
    }
