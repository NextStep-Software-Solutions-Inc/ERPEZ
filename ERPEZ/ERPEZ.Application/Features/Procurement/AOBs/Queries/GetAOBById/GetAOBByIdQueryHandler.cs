using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;

public class GetAOBByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAOBByIdQuery, ApiResponse<AOBDetailResponse>>
{
    public async Task<ApiResponse<AOBDetailResponse>> Handle(GetAOBByIdQuery request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Where(a => a.Id == request.Id && !a.IsDeleted)
            .Select(a => new AOBDetailResponse
            {
                Id = a.Id,
                AOBNumber = a.AOBNumber,
                Description = a.Description,
                AwardCriterion = a.AwardCriterion,
                AOBDate = a.AOBDate,
                OpeningDate = a.OpeningDate,
                Status = a.Status,
                ProcurementProjects = a.AOBProcurementProjectMappings
                    .Where(m => m.ProcurementProject != null)
                    .Select(m => new AOBProjectDetailResponse
                    {
                        Id = m.ProcurementProjectId,
                        Title = m.ProcurementProject.Title,
                        ABC = m.ProcurementProject.ABC,
                        Status = m.ProcurementProject.Status
                    }).ToList(),
                AwardedItems = a.AOBAwardedItems.Select(ai => new AOBAwardedItemResponse
                {
                    Id = ai.Id,
                    APPItemId = ai.APPItemId,
                    APPItemName = ai.APPItem != null && ai.APPItem.PPMPItem != null ? ai.APPItem.PPMPItem.Name : string.Empty,
                    WinningSupplierId = ai.WinningSupplierId,
                    WinningSupplierName = ai.WinningSupplier != null ? ai.WinningSupplier.Name : string.Empty,
                    AwardedUnitPrice = ai.AwardedUnitPrice,
                    Score = ai.Score
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (aob == null)
        {
            return ApiResponse<AOBDetailResponse>.Fail("Abstract of Bids (AOB) not found.");
        }

        return ApiResponse<AOBDetailResponse>.Success(aob);
    }
}
