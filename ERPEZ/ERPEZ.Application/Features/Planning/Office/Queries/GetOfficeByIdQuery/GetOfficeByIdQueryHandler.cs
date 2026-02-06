using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;

public class GetOfficeByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOfficeByIdQuery, ApiResponse<OfficeResponse>>
{
    public async Task<ApiResponse<OfficeResponse>> Handle(GetOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.FindAsync(t => t.Id == request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var result = new OfficeResponse()
        {
            Id = office.Id,
            Name = office.Name,
            Code = office.Code,
            Address = office.Address,
            Description = office.Description,
            ResponsibilityCenterCode = office.ResponsibilityCenterCode,
            BudgetCostCenter = office.BudgetCostCenter,
            OfficeTypeId = office.OfficeTypeId,
            OrganizationId = office.OrganizationId,
            CategoryId = office.CategoryId,
            AdministrativeLevelId = office.AdministrativeLevelId,
            ClusterId = office.ClusterId,
            ProcurementWorkflowId = office.ProcurementWorkflowId,
            ParentId = office.ParentId,
            CreatedBy = office.CreatedBy,
            CreatedAt = office.CreatedAt
        };

        return ApiResponse<OfficeResponse>.Success(result, "Retrieved successfully");
    }
}
