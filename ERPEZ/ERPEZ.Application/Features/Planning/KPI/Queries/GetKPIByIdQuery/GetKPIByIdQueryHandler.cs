using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;

public class GetKPIByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIByIdQuery, ApiResponse<KPIResponse>>
{
    public async Task<ApiResponse<KPIResponse>> Handle(GetKPIByIdQuery request, CancellationToken cancellationToken)
    {
        var kpi = await unitOfWork.KPIRepository.FindAsync(t => t.Id == request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");
        var dto = new KPIResponse()
        {
            Id = kpi.Id,
            ParentKPIId = kpi.ParentKPIId,
            FunctionType = kpi.FunctionType,
            Description = kpi.Description,
            Name = kpi.Name,
            IsOfficeMandate = kpi.IsOfficeMandate,
            IsPercentage = kpi.IsPercentage,
            Status = kpi.Status,
            CreatedBy = kpi.CreatedBy,
            CreatedAt = kpi.CreatedAt
        };
        return ApiResponse<KPIResponse>.Success(dto, "Retrieved successfully");
    }
}
