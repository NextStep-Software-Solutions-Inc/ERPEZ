using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPById;

public class GetAPPByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPPByIdQuery, ApiResponse<APPResponse>>
{
    public async Task<ApiResponse<APPResponse>> Handle(GetAPPByIdQuery request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var response = new APPResponse
        {
            Id = app.Id,
            APPNumber = app.APPNumber,
            Name = app.Name,
            FiscalYearId = app.FiscalYearId,
            FiscalYearName = app.FiscalYear != null ? app.FiscalYear.Year.ToString() : string.Empty,
            OfficeId = app.OfficeId,
            OfficeName = app.Office?.Name ?? string.Empty,
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
        };

        return ApiResponse<APPResponse>.Success(response);
    }
}
