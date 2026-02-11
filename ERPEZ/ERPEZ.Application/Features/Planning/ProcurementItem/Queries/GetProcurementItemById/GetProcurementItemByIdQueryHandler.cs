using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItemById;

public class GetProcurementItemByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementItemByIdQuery, ApiResponse<ProcurementItemResponse>>
{
    public async Task<ApiResponse<ProcurementItemResponse>> Handle(
        GetProcurementItemByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementItemRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement item not found.");

        var response = new ProcurementItemResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Specifications = entity.Specifications,
            Type = entity.Type,
            IsCSE = entity.IsCSE,
            ItemLife = entity.ItemLife,
            ProductCode = entity.ProductCode,
            ImageURL = entity.ImageURL,
            IsActive = entity.IsActive,
            ObjectCodeId = entity.ObjectCodeId,
            ObjectCodeName = entity.ObjectCode?.Code ?? string.Empty,
            UNSPSCCodeId = entity.UNSPSCCodeId,
            UNSPSCCodeName = entity.UNSPSCCode?.Name ?? string.Empty,
            UOMId = entity.UOMId,
            UOMName = entity.UOM?.Name ?? string.Empty,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<ProcurementItemResponse>.Success(response);
    }
}
