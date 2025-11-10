using FluentValidation;
using System;
using System.Linq; // Required for the .Contains() extension method

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.CreateOPCREvaluation;

public class CreateOPCREvaluationCommandValidator : AbstractValidator<CreateOPCREvaluationCommand>
{
    private readonly string[] ValidEvaluationStatuses =
    [
        "Pending", "ReturnedForRevision", "Approved", "Finalized"
    ];

    public CreateOPCREvaluationCommandValidator()
    {
        // OPCRId (Required GUID)
        RuleFor(x => x.OPCRId)
            .NotEmpty()
            .WithMessage("OPCR ID is required.");

        // EvaluatorId (Required GUID)
        RuleFor(x => x.EvaluatorId)
            .NotEmpty()
            .WithMessage("Evaluator ID is required.");

        // EvaluationDate (Required DateTime)
        RuleFor(x => x.EvaluationDate)
            .NotEmpty()
            .WithMessage("Evaluation Date is required.")
            .Must(date => date != default(DateTime))
            .WithMessage("Evaluation Date must be a valid date.");

        // Comments (Optional String, Max Length)
        RuleFor(x => x.Comments)
            .MaximumLength(2000)
            .WithMessage("Comments cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Comments));

        // Status (Required String, Valid Value)
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(50)
            .WithMessage("Status cannot exceed 50 characters.")
            .Must(status => ValidEvaluationStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", ValidEvaluationStatuses)}.");
    }
}