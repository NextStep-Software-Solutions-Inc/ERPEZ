using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Shared.Common;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreatePurchaseOrderCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var purchaseOrder = new PurchaseOrder
            {
                PONumber = request.PONumber,
                ProcurementMode = request.ProcurementMode,
                SourceDocumentType = request.SourceDocumentType,
                SourceDocumentId = request.SourceDocumentId,
                SupplierId = request.SupplierId,
                Description = request.Description,
                Date = request.Date,
                PlaceOfDelivery = request.PlaceOfDelivery,
                DateOfDelivery = request.DateOfDelivery,
                DeliveryTerm = request.DeliveryTerm,
                PaymentTerm = request.PaymentTerm,
                SupportingDocumentUrl = request.SupportingDocumentUrl,
                TotalAmount = request.Items.Sum(i => i.Amount),
                PurchaseOrderItems = request.Items.Select(i => new PurchaseOrderItem
                {
                    SourceItemId = i.SourceItemId,
                    Description = i.Description,
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                    UnitPrice = i.UnitPrice,
                    Amount = i.Amount
                }).ToList()
            };

            await unitOfWork.PurchaseOrderRepository.AddAsync(purchaseOrder, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return ApiResponse<Guid>.Success(purchaseOrder.Id, "Purchase Order created successfully.");
        }
        catch (Exception ex)
        {
            return ApiResponse<Guid>.Fail(ex.Message);
        }
    }
}
