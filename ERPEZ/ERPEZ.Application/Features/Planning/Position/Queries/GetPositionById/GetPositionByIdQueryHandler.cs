using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionById;

public class GetPositionByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionByIdQuery, ApiResponse<PositionResponse>>
{
    public async Task<ApiResponse<PositionResponse>> Handle(GetPositionByIdQuery request, CancellationToken cancellationToken)
    {
        var position = await unitOfWork.PositionRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);

        if (position == null)
            throw new NotFoundException($"Position with ID '{request.Id}' not found.");

        var response = new PositionResponse
        {
            Id = position.Id,
            Title = position.Title,
            FunctionalTitle = position.FunctionalTitle,
            Code = position.Code,
            ItemNumber = position.ItemNumber,
            JobDescription = position.JobDescription,
            Qualifications = position.Qualifications,
            FTE = position.FTE,
            OperationalStatus = position.OperationalStatus,
            PositionType = position.PositionType != null ? new PositionTypeResponse
            {
                Id = position.PositionType.Id,
                Name = position.PositionType.Name,
                Code = position.PositionType.Code,
                IsActive = position.PositionType.IsActive,
                Description = position.PositionType.Description,
                EducationalLevel = position.PositionType.EducationalLevel,
                Category = position.PositionType.Category,
                IsCareerEligibilityRequired = position.PositionType.IsCareerEligibilityRequired,
                CanReportDirectly = position.PositionType.CanReportDirectly,
                CreatedAt = position.PositionType.CreatedAt
            } : null,
            PlantillaType = position.PlantillaType != null ? new PlantillaTypeResponse
            {
                Id = position.PlantillaType.Id,
                Name = position.PlantillaType.Name,
                Code = position.PlantillaType.Code,
                IsActive = position.PlantillaType.IsActive,
                AllowsContractual = position.PlantillaType.AllowsContractual,
                Duration = position.PlantillaType.Duration,
                RequiresActingAppointments = position.PlantillaType.RequiresActingAppointments,
                Benefits = position.PlantillaType.Benefits,
                CreatedAt = position.PlantillaType.CreatedAt
            } : null,
            SalaryGrade = position.SalaryGrade != null ? new SalaryGradeResponse
            {
                Id = position.SalaryGrade.Id,
                Name = position.SalaryGrade.Name,
                Code = position.SalaryGrade.Code,
                GradeNumber = position.SalaryGrade.GradeNumber,
                StepIncrementAmount = position.SalaryGrade.StepIncrementAmount,
                IsActive = position.SalaryGrade.IsActive,
                NumberOfSteps = position.SalaryGrade.NumberOfSteps,
                EffectiveDate = position.SalaryGrade.EffectiveDate,
                Description = position.SalaryGrade.Description,
                CreatedAt = position.SalaryGrade.CreatedAt
            } : null,
            Step = position.Step != null ? new StepResponse
            {
                Id = position.Step.Id,
                Name = position.Step.Name,
                Code = position.Step.Code,
                StepNumber = position.Step.StepNumber,
                MinStep = position.Step.MinStep,
                MaxStep = position.Step.MaxStep,
                IsActive = position.Step.IsActive,
                Description = position.Step.Description,
                CreatedAt = position.Step.CreatedAt
            } : null,
            Office = position.Office != null ? new OfficeResponse
            {
                Id = position.Office.Id,
                Name = position.Office.Name,
                Code = position.Office.Code,
                Address = position.Office.Address,
                Description = position.Office.Description,
                ResponsibilityCenterCode = position.Office.ResponsibilityCenterCode,
                BudgetCostCenter = position.Office.BudgetCostCenter,
                OfficeTypeId = position.Office.OfficeTypeId,
                OrganizationId = position.Office.OrganizationId,
                CategoryId = position.Office.CategoryId,
                AdministrativeLevelId = position.Office.AdministrativeLevelId,
                ClusterId = position.Office.ClusterId,
                ProcurementWorkflowId = position.Office.ProcurementWorkflowId,
                ParentId = position.Office.ParentId
            } : null
        };

        return ApiResponse<PositionResponse>.Success(response);
    }
}
