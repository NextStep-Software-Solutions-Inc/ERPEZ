using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;

public class GetDeliveryUnitByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDeliveryUnitByIdQuery, ApiResponse<Domain.Entities.Planning.DeliveryUnit>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.DeliveryUnit>> Handle(GetDeliveryUnitByIdQuery request, CancellationToken cancellationToken)
    {
        var deliveryUnit = await unitOfWork.DeliveryUnitRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.DeliveryUnit>.Success(deliveryUnit, "Retrieved successfully");
    }
}
