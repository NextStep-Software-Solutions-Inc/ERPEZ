using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.UpdatePurchaseOrder;

public class UpdatePurchaseOrderCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdatePurchaseOrderCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (purchaseOrder == null)
            return ApiResponse<bool>.Fail("Purchase Order not found.");

        if (purchaseOrder.Status != StatusEnum.Draft && purchaseOrder.Status != StatusEnum.Returned)
            return ApiResponse<bool>.Fail("Only Draft or Returned Purchase Orders can be updated.");

        if (request.SourceDocumentId != Guid.Empty && request.SourceDocumentId != purchaseOrder.SourceDocumentId)
            return ApiResponse<bool>.Fail("Source document cannot be changed after creation.");

        if (!string.IsNullOrWhiteSpace(request.PONumber) &&
            !string.Equals(request.PONumber.Trim(), purchaseOrder.PONumber, StringComparison.OrdinalIgnoreCase))
        {
            var duplicate = await unitOfWork.PurchaseOrderRepository
                .FindAsync(p => p.Id != purchaseOrder.Id && p.PONumber.ToLower() == request.PONumber.Trim().ToLower(), cancellationToken);
            if (duplicate != null)
            {
                return ApiResponse<bool>.Fail($"Purchase Order with number '{request.PONumber.Trim()}' already exists.");
            }
            purchaseOrder.PONumber = request.PONumber.Trim();
        }

        if (request.SupplierId.HasValue && request.SupplierId.Value != Guid.Empty)
        {
            purchaseOrder.SupplierId = request.SupplierId.Value;
        }
        else if (request.RetailStoreInfo != null && !string.IsNullOrWhiteSpace(request.RetailStoreInfo.Name))
        {
            string storeName = request.RetailStoreInfo.Name.Trim();
            var existing = await unitOfWork.SupplierRepository
                .FindAsync(s => s.Name.ToLower() == storeName.ToLower(), cancellationToken);

            if (existing != null)
            {
                purchaseOrder.SupplierId = existing.Id;
            }
            else
            {
                var category = await unitOfWork.SupplierCategoryRepository
                    .FindAsync(c => c.Name == "Retail Store", cancellationToken);
                if (category == null)
                {
                    category = await unitOfWork.SupplierCategoryRepository
                        .FindAsync(c => true, cancellationToken);
                }
                if (category == null)
                {
                    category = new SupplierCategory
                    {
                        Name = "Retail Store",
                        Description = "Direct Acquisition Retail Stores"
                    };
                    await unitOfWork.SupplierCategoryRepository.AddAsync(category, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }

                string tin = !string.IsNullOrWhiteSpace(request.RetailStoreInfo.TIN)
                    ? request.RetailStoreInfo.TIN.Trim()
                    : $"DA-TIN-{Guid.NewGuid():N}"[..15];

                var newSupplier = new Supplier
                {
                    Name = storeName,
                    TINNumber = tin,
                    BusinessPermitNo = $"BP-{Guid.NewGuid():N}"[..15],
                    Address = !string.IsNullOrWhiteSpace(request.RetailStoreInfo.Address) ? request.RetailStoreInfo.Address.Trim() : "Retail Store",
                    ContactPerson = "Store Representative",
                    ContactNumber = "N/A",
                    Email = $"{storeName.Replace(" ", "").ToLower()}@retail.local",
                    SupplierCategoryId = category.Id,
                    Status = nameof(SupplierStatusEnum.Approved),
                    IsBlocked = false
                };
                await unitOfWork.SupplierRepository.AddAsync(newSupplier, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                purchaseOrder.SupplierId = newSupplier.Id;
            }
        }

        purchaseOrder.Description = request.Description;
        purchaseOrder.Date = request.Date;
        purchaseOrder.PlaceOfDelivery = request.PlaceOfDelivery;
        purchaseOrder.DateOfDelivery = request.DateOfDelivery;
        purchaseOrder.DeliveryTerm = request.DeliveryTerm;
        purchaseOrder.PaymentTerm = request.PaymentTerm;
        purchaseOrder.SupportingDocumentUrl = request.SupportingDocumentUrl;

        unitOfWork.PurchaseOrderRepository.Update(purchaseOrder);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "Purchase Order updated successfully.");
    }
}
