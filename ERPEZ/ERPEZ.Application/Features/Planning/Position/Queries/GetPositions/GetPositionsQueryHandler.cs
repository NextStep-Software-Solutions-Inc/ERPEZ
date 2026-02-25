using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.Step.Dtos;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositions;

public class GetPositionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionsQuery, PaginatedApiResponse<PositionResponse>>
{
    public async Task<PaginatedApiResponse<PositionResponse>> Handle(GetPositionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (positions, totalCount) = await unitOfWork.PositionRepository.GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var positionResponses = positions.Select(p => new PositionResponse
        {
            Id = p.Id,
            Title = p.Title,
            FunctionalTitle = p.FunctionalTitle,
            Code = p.Code,
            JobDescription = p.JobDescription,
            Qualifications = p.Qualifications,
            FTE = p.FTE,
            OperationalStatus = p.OperationalStatus,
            PositionType = p.PositionType != null ? new PositionTypeResponse
            {
                Id = p.PositionType.Id,
                Name = p.PositionType.Name,
                Code = p.PositionType.Code,
                IsActive = p.PositionType.IsActive,
                Description = p.PositionType.Description,
                EducationalLevel = p.PositionType.EducationalLevel,
                Category = p.PositionType.Category,
                IsCareerEligibilityRequired = p.PositionType.IsCareerEligibilityRequired,
                CanReportDirectly = p.PositionType.CanReportDirectly
            } : null,
            PlantillaType = p.PlantillaType != null ? new PlantillaTypeResponse
            {
                Id = p.PlantillaType.Id,
                Name = p.PlantillaType.Name,
                Code = p.PlantillaType.Code,
                IsActive = p.PlantillaType.IsActive,
                AllowsContractual = p.PlantillaType.AllowsContractual,
                Duration = p.PlantillaType.Duration,
                RequiresActingAppointments = p.PlantillaType.RequiresActingAppointments,
                Benefits = p.PlantillaType.Benefits
            } : null,
            SalaryGrade = p.SalaryGrade != null ? new SalaryGradeResponse
            {
                Id = p.SalaryGrade.Id,
                Name = p.SalaryGrade.Name,
                Code = p.SalaryGrade.Code,
                GradeNumber = p.SalaryGrade.GradeNumber,
                StepIncrementAmount = p.SalaryGrade.StepIncrementAmount,
                IsActive = p.SalaryGrade.IsActive,
                NumberOfSteps = p.SalaryGrade.NumberOfSteps,
                EffectiveDate = p.SalaryGrade.EffectiveDate,
                Description = p.SalaryGrade.Description
            } : null,
            Step = p.Step != null ? new StepResponse
            {
                Id = p.Step.Id,
                Name = p.Step.Name,
                Code = p.Step.Code,
                StepNumber = p.Step.StepNumber,
                MinStep = p.Step.MinStep,
                MaxStep = p.Step.MaxStep,
                IsActive = p.Step.IsActive,
                Description = p.Step.Description
            } : null,
            Office = p.Office != null ? new OfficeResponse
            {
                Id = p.Office.Id,
                Name = p.Office.Name,
                Code = p.Office.Code,
                Address = p.Office.Address,
                Description = p.Office.Description,
                ResponsibilityCenterCode = p.Office.ResponsibilityCenterCode,
                BudgetCostCenter = p.Office.BudgetCostCenter,
                OfficeTypeId = p.Office.OfficeTypeId,
                OrganizationId = p.Office.OrganizationId,
                CategoryId = p.Office.CategoryId,
                AdministrativeLevelId = p.Office.AdministrativeLevelId,
                ClusterId = p.Office.ClusterId,
                ProcurementWorkflowId = p.Office.ProcurementWorkflowId,
                ParentId = p.Office.ParentId
            } : null
        });

        return new PaginatedApiResponse<PositionResponse>(
            [.. positionResponses],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
