using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIByIdQuery;

public class GetMFOKPIByIdQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetMFOKPIByIdQuery, ApiResponse<Domain.Entities.Planning.MFOKPI>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.MFOKPI>> Handle(GetMFOKPIByIdQuery request, CancellationToken cancellationToken)
    {
        var mfokpi = await _unitOfWork.MFOKPIRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.MFOKPI>.Success(mfokpi, "Retrieved successfully");
    }
}
