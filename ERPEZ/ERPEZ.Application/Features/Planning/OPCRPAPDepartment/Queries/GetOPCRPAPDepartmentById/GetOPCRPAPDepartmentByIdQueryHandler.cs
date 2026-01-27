using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
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
            DeliveryUnit = new DeliveryUnitResponse
            {
                Id = oPCRPAPDepartment.DeliveryUnit.Id,
                Office = new OfficeResponse
                {
                    Id = oPCRPAPDepartment.DeliveryUnit.Office.Id,
                    OfficeHead = oPCRPAPDepartment.DeliveryUnit.Office.OfficeHead,
                    Name = oPCRPAPDepartment.DeliveryUnit.Office.Name,
                    Description = oPCRPAPDepartment.DeliveryUnit.Office.Description,
                    Address = oPCRPAPDepartment.DeliveryUnit.Office.Address,
                    Email = oPCRPAPDepartment.DeliveryUnit.Office.Email,
                    ContactNumber = oPCRPAPDepartment.DeliveryUnit.Office.ContactNumber,
                    ResponsibilityCenterCode = oPCRPAPDepartment.DeliveryUnit.Office.ResponsibilityCenterCode,
                    CreatedAt = oPCRPAPDepartment.DeliveryUnit.Office.CreatedAt,
                    CreatedBy = oPCRPAPDepartment.DeliveryUnit.Office.CreatedBy,
                    IsDeliveryUnit = false,
                    ClusterId = oPCRPAPDepartment.DeliveryUnit.Office.ClusterId,
                    Cluster = null
                },
                ParentId = oPCRPAPDepartment.DeliveryUnit.ParentId,
                CreatedAt = oPCRPAPDepartment.DeliveryUnit.CreatedAt
            }
        };

        return ApiResponse<OPCRPAPDepartmentResponse>.Success(response, "Retrieved successfully");
    }
}

