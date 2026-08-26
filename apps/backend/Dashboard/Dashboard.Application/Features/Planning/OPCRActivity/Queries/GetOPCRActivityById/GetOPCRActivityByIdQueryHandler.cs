using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Queries.GetOPCRActivityById;
public class GetOPCRActivityByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRActivityByIdQuery, ApiResponse<OPCRActivityResponse>>
{
    public async Task<ApiResponse<OPCRActivityResponse>> Handle(GetOPCRActivityByIdQuery request, CancellationToken cancellationToken)
    {
        var opcrActivitieQuery = unitOfWork.OPCRActivityRepository
            .Query(t => t.Id == request.Id)
            .Select(t => new OPCRActivityResponse
            {
                Id = t.Id,
                OPCRItemId = t.OPCRItemId,
                Name = t.Name,
                Description = t.Description,
                Budget = t.Budget,
                PAPDepartments = t.OPCRPAPDepartments.Select(p => new OPCRPAPDepartmentResponse ()
                {
                    Id = p.Id,
                    OPCRActivityId = p.OPCRActivityId,
                    Office = new OfficeResponse
                    {
                        Id = p.Office!.Id,
                        Name = p.Office.Name,
                        Code = p.Office.Code,
                        Address = p.Office.Address,
                        Description = p.Office.Description,
                        ResponsibilityCenterCode = p.Office.ResponsibilityCenterCode,
                        ClusterId = p.Office.ClusterId,
                        Cluster = p.Office.Cluster == null ? null : new()
                        {
                            Id = p.Office.Cluster.Id,
                            Name = p.Office.Cluster.Name
                        }
                    }
                }).ToList()
            });

        var response = await unitOfWork.OPCRActivityRepository.GetSingleAsync(opcrActivitieQuery, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRActivityResponse>.Success(response, "OPCR Activity retrieved successfully.");
    }
}
