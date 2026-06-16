using ERPEZ.Application.Features.Planning.OPCRConsolidation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRConsolidation.Queries;

public class GetOPCRConsolidationByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRConsolidationByIdQuery, ApiResponse<OPCRConsolidationDetailedResponse>>
{
    public async Task<ApiResponse<OPCRConsolidationDetailedResponse>> Handle(
        GetOPCRConsolidationByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.OPCRConsolidationRepository
            .Query(c => c.Id == request.Id)
            .Select(c => new OPCRConsolidationDetailedResponse
            {
                Id = c.Id,
                Name = c.Name,
                FiscalYearId = c.FiscalYearId,
                FiscalYear = c.FiscalYear.Year,
                CreatedDate = DateOnly.FromDateTime(c.CreatedAt),
                OPCRs = c.OPCRs.Select(o => new OPCRConsolidationItemResponse
                {
                    Id = o.Id,
                    Name = o.Name,
                    Code = o.Code,
                    OfficeId = o.OfficeId,
                    OfficeName = o.Office.Name
                }).ToList()
            });

        var consolidation = await unitOfWork.OPCRConsolidationRepository.GetSingleAsync(query, cancellationToken)
            ?? throw new NotFoundException("OPCR consolidation not found.");

        return ApiResponse<OPCRConsolidationDetailedResponse>.Success(consolidation);
    }
}