    using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
    using ERPEZ.Domain.Entities.Procurement;
    using ERPEZ.Domain.Enums;
    using ERPEZ.Domain.Interfaces;
    using ERPEZ.Shared.Common;
    using ERPEZ.Shared.Exceptions;
    using MediatR;

    namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.CreatePR;

    public class CreatePRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreatePRCommand, ApiResponse<Guid>>
    {
        public async Task<ApiResponse<Guid>> Handle(CreatePRCommand request, CancellationToken cancellationToken)
        {
            _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
                ?? throw new NotFoundException($"Office with ID {request.OfficeId} not found.");

            if (request.FundSourceId.HasValue)
                _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId.Value, cancellationToken)
                    ?? throw new NotFoundException($"Fund Source with ID {request.FundSourceId.Value} not found.");

            if (request.ProcurementCategoryId.HasValue)
                _ = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.ProcurementCategoryId.Value, cancellationToken)
                    ?? throw new NotFoundException($"Procurement Category with ID {request.ProcurementCategoryId.Value} not found.");

            if (request.PPMPId.HasValue)
                _ = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId.Value, cancellationToken)
                    ?? throw new NotFoundException($"PPMP with ID {request.PPMPId.Value} not found.");

            var existing = await unitOfWork.PurchaseRequestRepository.FindAsync(
                x => x.PRNumber == request.PRNumber && !x.IsDeleted, cancellationToken);

            if (existing is not null)
                throw new ConflictException($"A Purchase Request with number '{request.PRNumber}' already exists.");

            var prItems = new List<PRItem>();
            decimal totalAmount = 0;

            foreach (var itemRequest in request.Items)
            {
                var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdWithDetailsAsync(
                    itemRequest.PPMPItemId!.Value, cancellationToken)
                    ?? throw new NotFoundException($"PPMP Item with ID {itemRequest.PPMPItemId} not found.");

                if (request.PRType == PRType.NonCSE && ppmpItem.CSEItemId.HasValue)
                    throw new ValidationException($"Item '{ppmpItem.Name}' is a CSE item and cannot be added to a Non-CSE PR.");

                await ValidatePPMPItemBudget(ppmpItem.Id, itemRequest.RequestedMonth, itemRequest.RequestedQuantity, ppmpItem.UnitPrice, ppmpItem, null, cancellationToken);

                prItems.Add(BuildPRItem(itemRequest));
                totalAmount += itemRequest.RequestedQuantity * itemRequest.UnitCost;
            }

            var pr = new PurchaseRequest
            {
                PRNumber              = request.PRNumber,
                Description           = request.Description,
                Purpose               = request.Purpose,
                PRType                = request.PRType,
                OfficeId              = request.OfficeId,
                PPMPId                = request.PPMPId,
                FundSourceId         = request.FundSourceId,
                UACSCodeCombinationId = request.UACSCodeCombinationId,
                ProcurementCategoryId = request.ProcurementCategoryId,
                RequestedDate         = request.RequestedDate,
                TotalAmount           = totalAmount,
                Status                = StatusEnum.Draft,
                ProcurementProjectId  = request.ProcurementProjectId,
                PRItems               = prItems
            };

            await unitOfWork.PurchaseRequestRepository.AddAsync(pr, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(pr.Id, "Purchase Request created successfully.");
        }

        private async Task ValidatePPMPItemBudget(
            Guid ppmpItemId,
            AllocationMonthEnum requestedMonth,
            int requestedQty,
            decimal unitPrice,
            Domain.Entities.Planning.PPMPItem ppmpItem,
            Guid? currentPRId,
            CancellationToken cancellationToken)
        {
            var existingItems = await unitOfWork.PRItemRepository.FindAllAsync(
                i => i.PPMPItemId == ppmpItemId &&
                    i.RequestedMonth == requestedMonth &&
                    !i.PurchaseRequest.IsDeleted &&
                    i.PurchaseRequest.Status != StatusEnum.Returned &&
                    (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value),
                cancellationToken);

            var totalAllocated   = ppmpItem.PPMPItemAllocations.Where(a => a.AllocationMonth == requestedMonth).Sum(a => a.Quantity);
            var reservedQty      = existingItems.Sum(i => i.RequestedQuantity);
            var reservedCost     = existingItems.Sum(i => i.Amount);
            var ppmpBudget       = unitPrice * totalAllocated;
            var newCost          = requestedQty * unitPrice;

            if (reservedQty + requestedQty > totalAllocated)
                throw new ValidationException(
                    $"Requested quantity for '{ppmpItem.Name}' in month {requestedMonth} exceeds PPMP allocation. Available: {totalAllocated - reservedQty}, Requested: {requestedQty}.");

            if (reservedCost + newCost > ppmpBudget)
                throw new ValidationException(
                    $"Requested amount for '{ppmpItem.Name}' in month {requestedMonth} exceeds PPMP budget. Remaining: ₱{ppmpBudget - reservedCost:N2}, Requested: ₱{newCost:N2}.");
        }

        private static PRItem BuildPRItem(PRItemRequest req) => new()
        {
            PPMPItemId        = req.PPMPItemId!.Value,
            APRItemId         = req.APRItemId,
            Name              = req.Name,
            Description       = req.Description,
            UnitCost          = req.UnitCost,
            RequestedQuantity = req.RequestedQuantity,
            Amount            = req.RequestedQuantity * req.UnitCost,
            StockNo           = req.StockNo,
            IsNonCSE          = req.IsNonCSE,
            RequestedMonth    = req.RequestedMonth
        };
    }