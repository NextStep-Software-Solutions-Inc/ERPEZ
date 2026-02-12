using ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodeById;

public class GetUNSPSCCodeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUNSPSCCodeByIdQuery, ApiResponse<UNSPSCCodeResponse>>
{
    public async Task<ApiResponse<UNSPSCCodeResponse>> Handle(
        GetUNSPSCCodeByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UNSPSCCodeRepository.Query()
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("UNSPSC code not found.");

        // Get children recursively based on level
        List<UNSPSCCodeResponse>? children = null;
        if (entity.Level < 4)
        {
            var childEntities = await unitOfWork.UNSPSCCodeRepository.Query()
                .Where(x => x.ParentId == entity.Id)
                .ToListAsync(cancellationToken);

            children = childEntities.Select(child => new UNSPSCCodeResponse
            {
                Id = child.Id,
                Code = child.Code,
                Name = child.Name,
                Level = child.Level,
                ParentId = child.ParentId,
                ParentName = entity.Name,
                CreatedAt = child.CreatedAt,
                UpdatedAt = child.UpdatedAt,
                Children = null // Only show one level down
            }).ToList();
        }

        var response = new UNSPSCCodeResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Level = entity.Level,
            ParentId = entity.ParentId,
            ParentName = entity.Parent?.Name,
            Children = children,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<UNSPSCCodeResponse>.Success(response);
    }
}
