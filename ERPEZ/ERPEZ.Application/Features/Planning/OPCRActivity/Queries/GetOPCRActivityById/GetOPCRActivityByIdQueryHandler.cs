using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
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
                OPCRId = t.OPCRId,
                DUKPITargetAssignmentId = t.DUKPITargetAssignmentId,
                Name = t.Name,
                Description = t.Description,
                Budget = t.Budget,
                PAPDepartments = t.OPCRPAPDepartments.Select(p => new OPCRPAPDepartmentResponse ()
                {
                    Id = p.Id,
                    OPCRActivityId = p.OPCRActivityId,
                    DeliveryUnit = new ()
                    {
                        Id = p.DeliveryUnit.Id,
                        CreatedAt = p.DeliveryUnit.CreatedAt,
                        Office = new ()
                        {
                            Id = p.DeliveryUnit.Office.Id,
                            Name = p.DeliveryUnit.Office.Name,
                            Address = p.DeliveryUnit.Office.Address,
                            ContactNumber = p.DeliveryUnit.Office.ContactNumber,
                            CreatedBy = p.DeliveryUnit.Office.CreatedBy,
                            CreatedAt = p.DeliveryUnit.Office.CreatedAt,
                            Email = p.DeliveryUnit.Office.Email,
                            Description = p.DeliveryUnit.Office.Description,
                            OfficeHead = p.DeliveryUnit.Office.OfficeHead,
                            ResponsibilityCenterCode = p.DeliveryUnit.Office.ResponsibilityCenterCode,
                            Cluster = p.DeliveryUnit.Office.Cluster == null ? null : new()
                            {
                                Id = p.DeliveryUnit.Office.Cluster.Id,
                                Name = p.DeliveryUnit.Office.Cluster.Name,
                                Description = p.DeliveryUnit.Office.Cluster.Description,
                                CreatedAt = p.DeliveryUnit.Office.Cluster.CreatedAt,
                                CreatedBy = p.DeliveryUnit.Office.Cluster.CreatedBy,
                            }
                        },
                    }
                }).ToList()
            });

        var response = await unitOfWork.OPCRActivityRepository.GetSingleAsync(opcrActivitieQuery, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRActivityResponse>.Success(response, "OPCR Activity retrieved successfully.");
    }
}
