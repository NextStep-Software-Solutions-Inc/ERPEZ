using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.OPCR.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRById;

public class GetOPCRByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOPCRByIdQuery, ApiResponse<OPCRResponse>>
{
    public async Task<ApiResponse<OPCRResponse>> Handle(GetOPCRByIdQuery request, CancellationToken cancellationToken)
    {

        var opcrQuery = unitOfWork.OPCRRepository.Query(o => o.Id == request.Id)
            .Select(o => new OPCRResponse
            {
                Id = o.Id,
                Status = o.Status.ToString(),
                RatingStatus = o.RatingStatus.ToString(),
                SubmittedDate = o.RatingSubmittedDate.HasValue ? DateOnly.FromDateTime(o.RatingSubmittedDate.Value) : null,
                ReturnedDate = o.RatingReturnedDate.HasValue ? DateOnly.FromDateTime(o.RatingReturnedDate.Value) : null,
                Name = o.Name,
                TotalBudget = o.OPCRActivities.Sum(a => a.Budget),
                CreatedDate = DateOnly.FromDateTime(o.CreatedAt),
                FiscalYear = new()
                {
                    Id = o.FiscalYear.Id,
                    Year = o.FiscalYear.Year,
                    Description = o.FiscalYear.Description,
                    Status = o.FiscalYear.Status,
                    FunctionAllocations = o.FiscalYear.FunctionAllocations.Select(fa => new FunctionAllocationResponse
                    {
                        Id = fa.Id,
                        FunctionType = fa.FunctionType.ToString(),
                        Percentage = fa.Percentage,
                    }).ToList(),
                },
                DeliveryUnit = new DeliveryUnitResponse
                {
                    Id = o.DeliveryUnit.Id,
                    Office = new()
                    {
                        Id = o.DeliveryUnit.Office.Id,
                        Name = o.DeliveryUnit.Office.Name,
                        Address = o.DeliveryUnit.Office.Address,
                        ContactNumber = o.DeliveryUnit.Office.ContactNumber,
                        ClusterId = o.DeliveryUnit.Office.ClusterId,
                        Email = o.DeliveryUnit.Office.Email,
                        Description = o.DeliveryUnit.Office.Description,
                        OfficeHead = o.DeliveryUnit.Office.OfficeHead,
                        ResponsibilityCenterCode = o.DeliveryUnit.Office.ResponsibilityCenterCode,
                        CreatedBy = o.DeliveryUnit.Office.CreatedBy,
                        CreatedAt = o.DeliveryUnit.Office.CreatedAt,
                        Cluster = o.DeliveryUnit.Office.Cluster != null ? new()
                            {
                                Id = o.DeliveryUnit.Office.Cluster.Id,
                                Name = o.DeliveryUnit.Office.Cluster.Name,
                                Description = o.DeliveryUnit.Office.Cluster.Description,
                                CreatedBy = o.DeliveryUnit.Office.Cluster.CreatedBy,
                                CreatedAt = o.DeliveryUnit.Office.Cluster.CreatedAt,
                            } : null,
                    },
                   
                    KPITargetAssignments = o.DeliveryUnit.KPITargetAssignments.Select(ka => new KPITargetAssignmentResponse
                    {
                        Id = ka.Id,
                        KPI = new()
                        {
                            Id = ka.KPI.Id,
                            Name = ka.KPI.Name,
                            Description = ka.KPI.Description,
                            FunctionType = ka.KPI.FunctionType,
                            SDGs = ka.KPI.SDGs.Select(s => s.Name).ToList(),
                            MFOPAP = ka.KPI.MFOPAP != null ? new MFOPAPResponse
                            {
                                Id = ka.KPI.MFOPAP.Id,
                                Name = ka.KPI.MFOPAP.Name,
                                Code = ka.KPI.MFOPAP.Code,
                                Type = ka.KPI.MFOPAP.Type,
                                IsActive = ka.KPI.MFOPAP.IsActive,
                                ParentId = ka.KPI.MFOPAP.ParentId,
                            } : null,
                        },
                        AllocatedTargetValue = ka.AllocatedTargetValue,
                    }).ToList(),
                }
            });
        var opcr = await unitOfWork.OPCRRepository.GetFirstAsync(opcrQuery, cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<OPCRResponse>.Success(opcr, "OPCR retrieved successfully.");
    }
}
