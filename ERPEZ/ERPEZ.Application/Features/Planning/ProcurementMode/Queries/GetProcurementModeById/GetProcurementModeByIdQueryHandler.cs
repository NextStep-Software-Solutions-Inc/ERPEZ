using ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModeById;

public class GetProcurementModeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementModeByIdQuery, ApiResponse<ProcurementModeResponse>>
{
    public async Task<ApiResponse<ProcurementModeResponse>> Handle(
        GetProcurementModeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeRepository.Query()
            .Include(x => x.ProcurementCategory)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        var response = new ProcurementModeResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            ProcurementCategoryId = entity.ProcurementCategoryId,
            ProcurementCategoryName = entity.ProcurementCategory?.Name ?? string.Empty,
            IsArchived = entity.IsArchived,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<ProcurementModeResponse>.Success(response);
    }
}
