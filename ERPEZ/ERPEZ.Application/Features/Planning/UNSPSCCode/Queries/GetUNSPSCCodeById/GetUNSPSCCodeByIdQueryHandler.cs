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

        var response = new UNSPSCCodeResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Level = entity.Level,
            ParentId = entity.ParentId,
            ParentName = entity.Parent?.Name,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<UNSPSCCodeResponse>.Success(response);
    }
}
