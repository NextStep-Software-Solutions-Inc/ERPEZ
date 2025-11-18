using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;

public class GetMFOPAPByIdHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMFOPAPByIdQuery, ApiResponse<Domain.Entities.Planning.MFOPAP>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.MFOPAP>> Handle(
        GetMFOPAPByIdQuery request,
        CancellationToken cancellationToken)
    {
        var mfopap = await unitOfWork.MFOPAPRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.MFOPAP>.Success(mfopap, "Retrieved successfully");
    }
}
