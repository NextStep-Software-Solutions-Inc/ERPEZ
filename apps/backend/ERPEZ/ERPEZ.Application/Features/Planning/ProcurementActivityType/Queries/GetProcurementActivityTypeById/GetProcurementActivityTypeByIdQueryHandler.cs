using ERPEZ.Application.Features.Planning.ProcurementActivityType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypeById;

public class GetProcurementActivityTypeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementActivityTypeByIdQuery, ApiResponse<ProcurementActivityTypeResponse>>
{
    public async Task<ApiResponse<ProcurementActivityTypeResponse>> Handle(
        GetProcurementActivityTypeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementActivityTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement activity type not found.");

        var response = new ProcurementActivityTypeResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            MinDays = entity.MinDays,
            MaxDays = entity.MaxDays,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<ProcurementActivityTypeResponse>.Success(response);
    }
}
