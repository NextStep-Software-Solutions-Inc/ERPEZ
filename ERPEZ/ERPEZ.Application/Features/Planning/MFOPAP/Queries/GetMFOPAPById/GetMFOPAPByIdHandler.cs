using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPById;

public class GetMFOPAPByIdHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMFOPAPByIdQuery, ApiResponse<MFOPAPDetailedResponse>>
{
    public async Task<ApiResponse<MFOPAPDetailedResponse>> Handle(
        GetMFOPAPByIdQuery request,
        CancellationToken cancellationToken)
    {
        var mfopap = await unitOfWork.MFOPAPRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new MFOPAPDetailedResponse
        {
            Id = mfopap.Id,
            Name = mfopap.Name,
            Code = mfopap.Code,
            Description = null,
            OPCRId = null,
            CreatedAt = mfopap.CreatedAt,
            CreatedBy = mfopap.CreatedBy,
            UpdatedAt = mfopap.UpdatedAt,
            UpdatedBy = mfopap.UpdatedBy
        };

        return ApiResponse<MFOPAPDetailedResponse>.Success(response, "Retrieved successfully");
    }
}
