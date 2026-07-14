using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Data;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;

public class GetFYActiveKPIsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetFYActiveKPIsQuery, PaginatedApiResponse<FYActiveKPIResponse>>
{
    public async Task<PaginatedApiResponse<FYActiveKPIResponse>> Handle(
        GetFYActiveKPIsQuery request, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = request.PageSize,
            Page = request.PageNumber,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        Expression<Func<Domain.Entities.Planning.FYActiveKPI, FYActiveKPIResponse>> projection = fy => new FYActiveKPIResponse
        {
            Id = fy.Id,
            FiscalYearId = fy.FiscalYearId,
            MasterKPIId = fy.MasterKPIId,
            ParentKPIId = fy.ParentKPIId,
            MFOPAPId = fy.MFOPAPId,
            Name = fy.Name,
            Code = fy.Code,
            Description = fy.Description,
            MeasurementUnit = fy.MeasurementUnit,
            DistributionBehavior = fy.DistributionBehavior,
            FunctionCategory = fy.FunctionCategory,
            MonitoringFrequency = fy.MonitoringFrequency,
            IsOptInAvailable = fy.IsOptInAvailable,
            IsGAD = fy.IsGAD,
            Status = fy.Status,
            IsLocked = fy.IsLocked,
            AgencyTargetAnnual = fy.AgencyTargetAnnual,
            AgencyTargetQ1 = fy.AgencyTargetQ1,
            AgencyTargetQ2 = fy.AgencyTargetQ2,
            AgencyTargetQ3 = fy.AgencyTargetQ3,
            AgencyTargetQ4 = fy.AgencyTargetQ4,
            CreatedAt = fy.CreatedAt,
            CreatedBy = fy.CreatedBy,
            
            FYActiveKPIMeasurements = fy.FYActiveKPIMeasurements.Select(m => new FYActiveKPIMeasurementResponse
            {
                Id = m.Id,
                FYActiveKPIId = m.FYActiveKPIId,
                Name = m.Name,
                Statement = m.Statement,
                Dimensions = m.Dimensions,
                MOVs = m.MOVs,
                RatingScaleTemplateId = m.RatingScaleTemplateId,
                IsMOVEditable = m.IsMOVEditable,
                IsScaleEditable = m.IsScaleEditable,
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy
            }).ToList(),
            
            // Nested entities from Master KPI
            MFOPAP = fy.MasterKPI != null && fy.MasterKPI.MFOPAP != null ? new MFOPAPResponse
            {
                Id = fy.MasterKPI.MFOPAP.Id,
                ParentId = fy.MasterKPI.MFOPAP.ParentId,
                Name = fy.MasterKPI.MFOPAP.Name,
                Code = fy.MasterKPI.MFOPAP.Code,
                Type = fy.MasterKPI.MFOPAP.Type,
                IsActive = fy.MasterKPI.MFOPAP.IsActive
            } : null,
            
            Attributes = fy.MasterKPI != null ? fy.MasterKPI.Attributes.Select(a => new AttributeResponse
            {
                Id = a.Id,
                Name = a.Name,
                Code = a.Code,
                Description = a.Description,
                ParentAttributeId = a.ParentAttributeId
            }).ToList() : new List<AttributeResponse>(),
            
            SDGs = fy.MasterKPI != null ? fy.MasterKPI.SDGs.Select(s => new SDGResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                SdgCode = s.SdgCode   // ← add
            }).ToList() : new List<SDGResponse>(),
            FiscalYear = fy.FiscalYear == null ? null : new ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse
            {
                Id = fy.FiscalYear.Id,
                Year = fy.FiscalYear.Year,
                Description = fy.FiscalYear.Description,
                Status = fy.FiscalYear.Status,
                IsLocked = fy.FiscalYear.IsLocked,
                StartDate = fy.FiscalYear.StartDate,
                EndDate = fy.FiscalYear.EndDate
            }
        };

        var (items, totalCount) = await unitOfWork.FYActiveKPIRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<FYActiveKPIResponse>([.. items], request.PageNumber, request.PageSize, totalCount);
    }
}
