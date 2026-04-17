using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByFiscalYear;

public class GetPPMPsByFiscalYearQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetPPMPsByFiscalYearQuery, ApiResponse<List<PPMPDetailedResponse>>>
{
    public async Task<ApiResponse<List<PPMPDetailedResponse>>> Handle(GetPPMPsByFiscalYearQuery query, CancellationToken cancellationToken)
    {
        var ppmps = await unitOfWork.PPMPRepository.GetDetailedByFiscalYearAsync(query.FiscalYearId, cancellationToken);

        return ApiResponse<List<PPMPDetailedResponse>>.Success(ppmps.Select(ppmp => PPMPResponseMapper.MapDetailed(ppmp)).ToList());
    }
}
