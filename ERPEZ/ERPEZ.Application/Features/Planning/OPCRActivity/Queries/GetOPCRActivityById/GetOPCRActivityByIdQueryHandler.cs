using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;

public class GetOPCRActivityByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivityByIdQuery, ApiResponse<Domain.Entities.Planning.OPCRActivity>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.OPCRActivity>> Handle(GetOPCRActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrActivity = await unitOfWork.OPCRActivityRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.OPCRActivity>.Success(opcrActivity, "Retrieved successfully");
    }
}
