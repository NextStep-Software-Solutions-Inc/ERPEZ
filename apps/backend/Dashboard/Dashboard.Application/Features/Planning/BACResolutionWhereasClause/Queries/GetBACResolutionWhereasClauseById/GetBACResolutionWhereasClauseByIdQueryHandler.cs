using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Queries.GetBACResolutionWhereasClauseById;

public class GetBACResolutionWhereasClauseByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBACResolutionWhereasClauseByIdQuery, ApiResponse<BACResolutionWhereasClauseResponse>>
{
    public async Task<ApiResponse<BACResolutionWhereasClauseResponse>> Handle(GetBACResolutionWhereasClauseByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.BACResolutionWhereasClauseRepository.FindAsync(
            x => x.Id == request.Id,
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException("BAC resolution whereas clause not found.");

        var response = new BACResolutionWhereasClauseResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Body = entity.Body
        };

        return ApiResponse<BACResolutionWhereasClauseResponse>.Success(response, "Retrieved successfully.");
    }
}
