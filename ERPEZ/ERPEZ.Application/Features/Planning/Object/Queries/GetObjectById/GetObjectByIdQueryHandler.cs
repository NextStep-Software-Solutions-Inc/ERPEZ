using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;

public class GetObjectByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetObjectByIdQuery, ApiResponse<ObjectDetailedResponse>>
{
    public async Task<ApiResponse<ObjectDetailedResponse>> Handle(GetObjectByIdQuery request, CancellationToken cancellationToken)
    {
        var objectEntity = await unitOfWork.ObjectRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new ObjectDetailedResponse
        {
            Id = objectEntity.Id,
            Name = objectEntity.Name,
            Description = null,
            Code = objectEntity.Code,
            CreatedAt = objectEntity.CreatedAt,
            CreatedBy = objectEntity.CreatedBy,
            UpdatedAt = objectEntity.UpdatedAt,
            UpdatedBy = objectEntity.UpdatedBy
        };

        return ApiResponse<ObjectDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
