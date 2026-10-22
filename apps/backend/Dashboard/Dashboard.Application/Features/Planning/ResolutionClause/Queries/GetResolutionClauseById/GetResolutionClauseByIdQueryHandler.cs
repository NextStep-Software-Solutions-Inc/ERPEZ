using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Queries.GetResolutionClauseById;

public class GetResolutionClauseByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetResolutionClauseByIdQuery, ApiResponse<ResolutionClauseResponse>>
{
    public async Task<ApiResponse<ResolutionClauseResponse>> Handle(GetResolutionClauseByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ResolutionClauseRepository.FindAsync(
            x => x.Id == request.Id && !x.IsDeleted,
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Resolution clause not found.");

        var response = new ResolutionClauseResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Body = entity.Body,
            ClauseType = entity.ClauseType
        };

        return ApiResponse<ResolutionClauseResponse>.Success(response, "Retrieved successfully.");
    }
}
