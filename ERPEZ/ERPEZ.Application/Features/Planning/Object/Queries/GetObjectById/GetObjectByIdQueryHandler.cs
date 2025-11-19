using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjectById;

public class GetObjectByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetObjectByIdQuery, ApiResponse<Domain.Entities.Planning.Object>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Object>> Handle(GetObjectByIdQuery request, CancellationToken cancellationToken)
    {
        var req = await unitOfWork.ObjectRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.Object>.Success(req, "Retrieved successfully");
    }
}
