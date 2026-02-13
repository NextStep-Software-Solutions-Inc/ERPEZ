using ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModes;

public class GetProcurementModesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementModesQuery, PaginatedApiResponse<ProcurementModeResponse>>
{
    public async Task<PaginatedApiResponse<ProcurementModeResponse>> Handle(
        GetProcurementModesQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.ProcurementMode, ProcurementModeResponse>> projection = x => new ProcurementModeResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            ProcurementCategory = x.ProcurementCategory != null ? new ProcurementCategoryDto
            {
                Id = x.ProcurementCategory.Id,
                Name = x.ProcurementCategory.Name
            } : null,
            IsArchived = x.IsArchived,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var (modes, totalCount) = await unitOfWork.ProcurementModeRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<ProcurementModeResponse>(
            [.. modes],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
