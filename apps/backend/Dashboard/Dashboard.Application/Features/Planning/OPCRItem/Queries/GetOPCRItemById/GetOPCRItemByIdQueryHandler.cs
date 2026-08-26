using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCRItem.Dtos;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Queries.GetOPCRItemById;

public class GetOPCRItemByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRItemByIdQuery, ApiResponse<OPCRItemResponse>>
{
    public async Task<ApiResponse<OPCRItemResponse>> Handle(GetOPCRItemByIdQuery request, CancellationToken cancellationToken)
    {
        var query = unitOfWork.OPCRItemRepository.Query(i => i.Id == request.Id)
            .Select(item => new OPCRItemResponse
            {
                Id = item.Id,
                OPCRId = item.OPCRId,
                KPIAssignmentId = item.KPIAssignmentId,
                OfficeId = item.OPCR.OfficeId,
                OfficeName = item.OPCR.Office.Name,
                FiscalYearId = item.OPCR.FiscalYearId,
                FiscalYear = item.OPCR.FiscalYear.Year,
                KPIName = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.Name : string.Empty,
                DistributionBehavior = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.DistributionBehavior : string.Empty,
                MeasurementUnit = item.KPIAssignment.FYActiveKPI != null ? item.KPIAssignment.FYActiveKPI.MeasurementUnit : string.Empty,
                AssignedTargetAnnual = item.KPIAssignment.AssignedTargetAnnual,
                AssignedTargetQ1 = item.KPIAssignment.AssignedTargetQ1,
                AssignedTargetQ2 = item.KPIAssignment.AssignedTargetQ2,
                AssignedTargetQ3 = item.KPIAssignment.AssignedTargetQ3,
                AssignedTargetQ4 = item.KPIAssignment.AssignedTargetQ4,
                IsLocked = item.KPIAssignment.IsLocked,
                IsShopped = item.IsShopped,
                Q1Target = item.Q1Target,
                Q2Target = item.Q2Target,
                Q3Target = item.Q3Target,
                Q4Target = item.Q4Target,
                ProposedAnnualTarget = item.Q1Target + item.Q2Target + item.Q3Target + item.Q4Target,
                CreatedAt = item.CreatedAt,
                CreatedBy = item.CreatedBy,
                OPCRActivities = item.OPCRActivities.Select(a => new OPCRActivityResponse
                {
                    Id = a.Id,
                    OPCRItemId = a.OPCRItemId,
                    Name = a.Name,
                    Description = a.Description,
                    Budget = a.Budget,
                    PAPDepartments = a.OPCRPAPDepartments.Select(p => new OPCRPAPDepartmentResponse
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
                }).ToList()
            });

        var itemResponse = await unitOfWork.OPCRItemRepository.GetFirstAsync(query, cancellationToken)
            ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRItemResponse>.Success(itemResponse, "OPCR Item retrieved successfully.");
    }
}
