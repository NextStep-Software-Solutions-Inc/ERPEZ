using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.CreateItemPrice;

public class CreateItemPriceCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateItemPriceCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateItemPriceCommand request, CancellationToken cancellationToken)
    {
        // Validate ProcurementItem exists
        _ = await unitOfWork.ProcurementItemRepository.GetByIdAsync(request.ProcurementItemId, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        // Validate FiscalYear exists
        _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken)
            ?? throw new NotFoundException("Fiscal year not found.");

        // Check for existing price entry (ensure uniqueness)
        var existingPrice = await unitOfWork.ItemPriceRepository.ExistsAsync(
            request.ProcurementItemId,
            request.FiscalYearId,
            cancellationToken
        );

        if (existingPrice)
            throw new ConflictException("A price entry already exists for this procurement item in the specified fiscal year.");

        var entity = new Domain.Entities.Planning.ItemPrice
        {
            ProcurementItemId = request.ProcurementItemId,
            FiscalYearId = request.FiscalYearId,
            UnitPrice = request.UnitPrice
        };

        await unitOfWork.ItemPriceRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Item price created successfully.");
    }
}
