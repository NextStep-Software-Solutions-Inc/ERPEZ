using FluentValidation;
using ERPEZ.Domain.Enums;
using System;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.UpdateProcurementProjectStatus;

public class UpdateProcurementProjectStatusCommandValidator : AbstractValidator<UpdateProcurementProjectStatusCommand>
{
    public UpdateProcurementProjectStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Project Id is required.");

        RuleFor(x => x.StatusRequest.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => Enum.TryParse<StatusEnum>(status, true, out var parsed) && 
                            parsed is StatusEnum.Draft or StatusEnum.Submitted or StatusEnum.Returned or StatusEnum.Approved)
            .WithMessage("Status must be one of: Draft, Submitted, Returned, Approved.");
    }
}

