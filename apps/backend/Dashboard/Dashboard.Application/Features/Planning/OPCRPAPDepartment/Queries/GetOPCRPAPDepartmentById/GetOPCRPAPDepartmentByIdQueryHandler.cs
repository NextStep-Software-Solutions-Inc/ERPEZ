using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Queries.GetOPCRPAPDepartmentById;

public class GetOPCRPAPDepartmentByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRPAPDepartmentByIdQuery, ApiResponse<OPCRPAPDepartmentResponse>>
{
    public async Task<ApiResponse<OPCRPAPDepartmentResponse>> Handle(GetOPCRPAPDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var oPCRPAPDepartment = await unitOfWork.OPCRPAPDepartmentRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new OPCRPAPDepartmentResponse
        {
            Id = oPCRPAPDepartment.Id,
            OPCRActivityId = oPCRPAPDepartment.OPCRActivityId,
            Office = new OfficeResponse
            {
                Id = oPCRPAPDepartment.Office!.Id,
                Name = oPCRPAPDepartment.Office.Name,
                Code = oPCRPAPDepartment.Office.Code,
                Description = oPCRPAPDepartment.Office.Description,
                Address = oPCRPAPDepartment.Office.Address,
                ResponsibilityCenterCode = oPCRPAPDepartment.Office.ResponsibilityCenterCode,
                ClusterId = oPCRPAPDepartment.Office.ClusterId,
                Cluster = null
            }
        };

        return ApiResponse<OPCRPAPDepartmentResponse>.Success(response, "Retrieved successfully");
    }
}

