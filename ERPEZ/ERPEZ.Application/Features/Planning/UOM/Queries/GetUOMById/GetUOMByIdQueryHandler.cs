using ERPEZ.Application.Features.Planning.UOM.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.UOM.Queries.GetUOMById;

public class GetUOMByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUOMByIdQuery, ApiResponse<UOMResponse>>
{
    public async Task<ApiResponse<UOMResponse>> Handle(
        GetUOMByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UOMRepository.Query()
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("UOM not found.");

        var response = new UOMResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            ConversionFactor = entity.ConversionFactor,
            ParentId = entity.ParentId,
            ParentName = entity.Parent?.Name,
            Description = entity.Description,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<UOMResponse>.Success(response);
    }
}
