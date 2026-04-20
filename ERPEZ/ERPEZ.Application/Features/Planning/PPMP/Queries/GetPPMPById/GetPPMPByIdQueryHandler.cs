using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPById;

public class GetPPMPByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPByIdQuery, ApiResponse<PPMPDetailedResponse>>
{
    public async Task<ApiResponse<PPMPDetailedResponse>> Handle(GetPPMPByIdQuery query, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetPPMPWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        return ApiResponse<PPMPDetailedResponse>.Success(PPMPQueryProjection.BuildDetailedResponse(ppmp));
    }
}
