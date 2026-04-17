using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByOffice;

public class GetPPMPsByOfficeQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPsByOfficeQuery, ApiResponse<List<PPMPDetailedResponse>>>
{
    public async Task<ApiResponse<List<PPMPDetailedResponse>>> Handle(GetPPMPsByOfficeQuery query, CancellationToken cancellationToken)
    {
        var ppmps = await unitOfWork.PPMPRepository.GetDetailedByOfficeAsync(query.OfficeId, cancellationToken);

        return ApiResponse<List<PPMPDetailedResponse>>.Success(ppmps.Select(ppmp => PPMPResponseMapper.MapDetailed(ppmp)).ToList());
    }
}
