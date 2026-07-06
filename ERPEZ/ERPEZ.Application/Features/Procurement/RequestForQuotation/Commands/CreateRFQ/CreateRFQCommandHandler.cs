using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.CreateRFQ;

public class CreateRFQCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateRFQCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateRFQCommand request, CancellationToken cancellationToken)
    {
        // Business rule: RFQ Number must be unique.
        if (await unitOfWork.RFQRepository.HasRFQNumberAsync(request.RFQNumber, cancellationToken))
        {
            return ApiResponse<Guid>.Fail("RFQ Number already exists.");
        }
 
        // Business rule: Tracing Number must be unique.
        if (await unitOfWork.RFQRepository.HasTracingNumberAsync(request.TracingNumber, cancellationToken))
        {
            return ApiResponse<Guid>.Fail("Tracing Number already exists.");
        }
 
        // Business rule: every invited supplier must exist, not be blocked, and be Approved.
        foreach (var supplierId in request.SupplierIds.Distinct())
        {
            var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(supplierId, cancellationToken);
            if (supplier is null || supplier.IsBlocked || supplier.Status != nameof(SupplierStatusEnum.Approved))
            {
                return ApiResponse<Guid>.Fail("One or more selected suppliers are blocked or not approved.");
            }
        }
 
        var rfq = new Domain.Entities.Procurement.RFQ
        {
            RFQNumber = request.RFQNumber,
            TracingNumber = request.TracingNumber,
            Description = request.Description,
            Date = request.Date,
            Deadline = request.Deadline,
            DeliveryPeriod = request.DeliveryPeriod,
            Purpose = request.Purpose,
            Status = StatusEnum.Draft,
            TotalAmount = 0
        };
 
        foreach (var supplierId in request.SupplierIds.Distinct())
        {
            rfq.RFQSuppliers.Add(new RFQSupplier
            {
                SupplierId = supplierId,
                InvitedAt = DateTime.UtcNow
            });
        }
 
        await unitOfWork.RFQRepository.AddAsync(rfq, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
 
        return ApiResponse<Guid>.Success(rfq.Id, "RFQ created as Draft.");
    }
}
