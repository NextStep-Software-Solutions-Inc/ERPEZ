using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;

public class GetDeliveryUnitByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDeliveryUnitByIdQuery, ApiResponse<DeliveryUnitResponse>>
{
    public async Task<ApiResponse<DeliveryUnitResponse>> Handle(GetDeliveryUnitByIdQuery request, CancellationToken cancellationToken)
    {
        var deliveryUnitQuery = unitOfWork.DeliveryUnitRepository
        .Query(du => du.Id == request.Id)
        .Select(du => new DeliveryUnitResponse
        {
            Id = du.Id,
            Office = new ()
            {
                Id = du.Office.Id,
                Name = du.Office.Name,
                Address = du.Office.Address,
                ContactNumber = du.Office.ContactNumber,
                ClusterId = du.Office.ClusterId,
                Email = du.Office.Email,
                Description = du.Office.Description,
                OfficeHead = du.Office.OfficeHead,
                ResponsibilityCenterCode = du.Office.ResponsibilityCenterCode,
                CreatedBy = du.Office.CreatedBy,
                CreatedAt = du.Office.CreatedAt,
                 Cluster = du.Office.Cluster == null ? null : new()
                    {
                        Id = du.Office.Cluster.Id,
                        Name = du.Office.Cluster.Name,
                        Description = du.Office.Cluster.Description,
                        CreatedAt = du.Office.Cluster.CreatedAt,
                        CreatedBy = du.Office.Cluster.CreatedBy,
                    }
            },
           
            KPITargetAssignments = du.KPIAssignments.Select(ka => new KPITargetAssignmentResponse
            {
                Id = ka.Id,
                KPI = new()
                {
                    Id = ka.KPI.Id,
                    Name = ka.KPI.Name,
                    Description = ka.KPI.Description,
                    FunctionType = ka.KPI.FunctionType,
                    MFOPAP = ka.KPI.MFOPAP != null ? new MFOPAPResponse
                    {
                        Id = ka.KPI.MFOPAP.Id,
                        Name = ka.KPI.MFOPAP.Name,
                        Code = ka.KPI.MFOPAP.Code,
                        Type = ka.KPI.MFOPAP.Type,
                        IsActive = ka.KPI.MFOPAP.IsActive,
                        ParentId = ka.KPI.MFOPAP.ParentId,
                    } : null,
                    SDGs = ka.KPI.SDGs.Select(s => s.Name).ToList(),
                },
                AllocatedTargetValue = ka.AllocatedTargetValue,
                Targets = du.KPIAssignments
                    .Where(a => a.Id == ka.Id)
                    .Select(kt => new KPITargetResponse
                    {
                        Id = kt.Id,
                        Period = kt.KPITarget.Period.ToString(),
                        QuarterName = kt.KPITarget.QuarterName,
                        TargetValue = kt.KPITarget.TargetValue,
                    }).ToList(),
                DateAssigned = ka.CreatedAt.ToString("yyyy-MM-dd"),
                SubKPIs = ka.KPI.ChildKPIs.Select(subKPI => new SubKPI
                {
                    Id = subKPI.Id,
                    Name = subKPI.Name,
                    Description = subKPI.Description,
                    FunctionType = subKPI.FunctionType,
                    SDGs = subKPI.SDGs.Select(sdg => sdg.Name).ToList(),
                    AllocatedTargetValue = subKPI.KPIAssignments
                        .Where(a => a.KPIId == subKPI.Id && a.DeliveryUnitId == du.Id)
                        .Select(a => a.AllocatedTargetValue)
                        .FirstOrDefault(),
                }).ToList(),
            }).ToList(),
            SubDeliveryUnits = du.SubDeliveryUnits.Select(subDU => new DeliveryUnitResponse
            {
                Id = subDU.Id,
                Office = new ()
                {
                    Id = subDU.Office.Id,
                    Name = subDU.Office.Name,
                    Address = subDU.Office.Address,
                    ContactNumber = subDU.Office.ContactNumber,
                    ClusterId = subDU.Office.ClusterId,
                    Email = subDU.Office.Email,
                    Description = subDU.Office.Description,
                    OfficeHead = subDU.Office.OfficeHead,
                    ResponsibilityCenterCode = subDU.Office.ResponsibilityCenterCode,
                    CreatedBy = subDU.Office.CreatedBy,
                    CreatedAt = subDU.Office.CreatedAt,
                    Cluster = du.Office.Cluster == null ? null : new()
                        {
                            Id = du.Office.Cluster.Id,
                            Name = du.Office.Cluster.Name,
                            Description = du.Office.Cluster.Description,
                            CreatedAt = du.Office.Cluster.CreatedAt,
                            CreatedBy = du.Office.Cluster.CreatedBy,
                        }
                },
                ParentId = subDU.ParentId,
                KPITargetAssignments = subDU.KPIAssignments.Select(ka => new KPITargetAssignmentResponse
                {
                    Id = ka.Id,
                    KPI = new()
                    {
                        Id = ka.KPI.Id,
                        Name = ka.KPI.Name,
                        Description = ka.KPI.Description,
                        FunctionType = ka.KPI.FunctionType,
                        MFOPAP = ka.KPI.MFOPAP != null ? new MFOPAPResponse
                        {
                            Id = ka.KPI.MFOPAP.Id,
                            Name = ka.KPI.MFOPAP.Name,
                            Code = ka.KPI.MFOPAP.Code,
                            Type = ka.KPI.MFOPAP.Type,
                            IsActive = ka.KPI.MFOPAP.IsActive,
                            ParentId = ka.KPI.MFOPAP.ParentId,
                        } : null,
                        SDGs = ka.KPI.SDGs.Select(s => s.Name).ToList(),
                    },
                    AllocatedTargetValue = ka.AllocatedTargetValue,
                    Targets = subDU.KPIAssignments
                        .Where(a => a.Id == ka.Id)
                        .Select(kt => new KPITargetResponse
                        {
                            Id = kt.Id,
                            Period = kt.KPITarget.Period.ToString(),
                            QuarterName = kt.KPITarget.QuarterName,
                            TargetValue = kt.KPITarget.TargetValue,
                        }).ToList(),
                    DateAssigned = ka.CreatedAt.ToString("yyyy-MM-dd"),
                    SubKPIs = ka.KPI.ChildKPIs.Select(subKPI => new SubKPI
                    {
                        Id = subKPI.Id,
                        Name = subKPI.Name,
                        Description = subKPI.Description,
                        FunctionType = subKPI.FunctionType,
                        SDGs = subKPI.SDGs.Select(sdg => sdg.Name).ToList(),
                        AllocatedTargetValue = subKPI.KPIAssignments
                            .Where(a => a.KPIId == subKPI.Id && a.DeliveryUnitId == subDU.Id)
                            .Select(a => a.AllocatedTargetValue)
                            .FirstOrDefault(),
                    }).ToList(),
                }).ToList(),
                CreatedAt = subDU.CreatedAt,
            }).ToList(),
            CreatedAt = du.CreatedAt,
        });

        var deliveryUnit = await unitOfWork.DeliveryUnitRepository.GetFirstAsync(deliveryUnitQuery, cancellationToken) ?? throw new NotFoundException("Delivery Unit not found");

        return ApiResponse<DeliveryUnitResponse>.Success(deliveryUnit, "Retrieved successfully");
    }
}
