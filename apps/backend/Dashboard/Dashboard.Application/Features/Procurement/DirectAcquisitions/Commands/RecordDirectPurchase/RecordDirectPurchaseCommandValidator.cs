using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.RecordDirectPurchase;

public class RecordDirectPurchaseCommandValidator : AbstractValidator<RecordDirectPurchaseCommand>
{
    public RecordDirectPurchaseCommandValidator()
    {
        RuleFor(v => v.DirectAcquisitionId)
            .NotEmpty().WithMessage("Direct Acquisition ID is required.");

        RuleFor(v => v.Request.SupplierName)
            .NotEmpty().WithMessage("Retail supplier / store name is required.");

        RuleFor(v => v.Request.FinalAmount)
            .GreaterThan(0).WithMessage("Final transaction amount must be greater than zero.")
            .LessThanOrEqualTo(200000m).WithMessage("Actual purchase amount must not exceed the legislative threshold of ₱200,000.");

        When(v => v.Request.PaymentMethod == DirectAcquisitionPaymentMethodEnum.EMPLOYEE_REIMBURSEMENT, () =>
        {
            RuleFor(v => v.Request.PayeeName)
                .NotEmpty().WithMessage("Payee selection is required when payment method is Employee Reimbursement.");
        });
    }
}
