using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.RemoveAPRItem;

public class RemoveAPRItemCommandHandler(
    IUnitOfWork unitOfWork,
    ILogger<RemoveAPRItemCommandHandler> logger)
    : IRequestHandler<RemoveAPRItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        RemoveAPRItemCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.APRId, cancellationToken)
            ?? throw new NotFoundException("APR not found.");

        if (apr.Status != StatusEnum.Draft && apr.Status != StatusEnum.Returned)
        {
            return ApiResponse<Guid>.Fail(
                $"Only APRs in Draft or Returned status can be edited. Current status: {apr.Status}.");
        }

        var identifier = request.ItemIdentifier.Trim();
        var item = apr.APRItems.FirstOrDefault(i =>
            i.Id.ToString().Equals(identifier, StringComparison.OrdinalIgnoreCase) ||
            (i.ItemCode != null && i.ItemCode.Equals(identifier, StringComparison.OrdinalIgnoreCase)) ||
            (i.APPItemId.HasValue && i.APPItemId.Value.ToString().Equals(identifier, StringComparison.OrdinalIgnoreCase)) ||
            (i.PPMPItemId.HasValue && i.PPMPItemId.Value.ToString().Equals(identifier, StringComparison.OrdinalIgnoreCase)));

        if (item is null)
        {
            return ApiResponse<Guid>.Fail("Item not found in this APR.");
        }

        unitOfWork.APRItemRepository.Remove(item);
        apr.APRItems.Remove(item);
        apr.TotalAmount = apr.APRItems.Sum(i => i.TotalCost);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Successfully removed item {ItemIdentifier} from APR {AprId}", identifier, apr.Id);

        return ApiResponse<Guid>.Success(apr.Id, "Item removed from APR successfully.");
    }
}
