using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPs;

public class GetAPPsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPPsQuery, PaginatedApiResponse<APPResponse>>
{
    public async Task<PaginatedApiResponse<APPResponse>> Handle(GetAPPsQuery request, CancellationToken cancellationToken)
    {
        var (apps, totalCount) = await unitOfWork.APPRepository.GetAllAsync(
            request.SieveModel,
            app => new APPResponse
            {
                Id = app.Id,
                APPNumber = app.APPNumber,
                Name = app.Name,
                FiscalYearId = app.FiscalYearId,
                FiscalYearName = app.FiscalYear != null ? app.FiscalYear.Year.ToString() : string.Empty,
                OfficeId = app.OfficeId,
                OfficeName = app.Office!.Name,
                IsFinal = app.IsFinal,
                Remarks = app.Remarks,
                Description = app.Description,
                Status = app.Status.ToString(),
                SubmittedDate = app.SubmittedDate,
                ApprovedDate = app.ApprovedDate,
                CreatedAt = app.CreatedAt,
                CreatedBy = app.CreatedBy,
                UpdatedAt = app.UpdatedAt,
                UpdatedBy = app.UpdatedBy
            },
            cancellationToken
        );

        return new PaginatedApiResponse<APPResponse>(
            [.. apps],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
