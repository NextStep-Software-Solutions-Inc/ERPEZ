using ERPEZ.Application.Features.Planning.UOM.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMs;

public class GetUOMsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUOMsQuery, PaginatedApiResponse<UOMResponse>>
{
    public async Task<PaginatedApiResponse<UOMResponse>> Handle(
        GetUOMsQuery request,
        CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.UOM, UOMResponse>> projection = x => new UOMResponse
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            ConversionFactor = x.ConversionFactor,
            ParentId = x.ParentId,
            ParentName = x.Parent != null ? x.Parent.Name : null,
            Description = x.Description,
            IsActive = x.IsActive,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var (uoms, totalCount) = await unitOfWork.UOMRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<UOMResponse>(
            [.. uoms],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
