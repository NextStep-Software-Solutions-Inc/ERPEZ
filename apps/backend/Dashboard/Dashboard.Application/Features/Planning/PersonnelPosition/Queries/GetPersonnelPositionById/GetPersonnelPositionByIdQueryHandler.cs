using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositionById;

public class GetPersonnelPositionByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPersonnelPositionByIdQuery, ApiResponse<PersonnelPositionResponse>>
{
    public async Task<ApiResponse<PersonnelPositionResponse>> Handle(GetPersonnelPositionByIdQuery request, CancellationToken cancellationToken)
    {
        var personnelPosition = await unitOfWork.PersonnelPositionRepository
            .GetByIdWithIncludesAsync(request.Id, cancellationToken);

        if (personnelPosition == null)
            throw new NotFoundException($"Personnel Position with ID '{request.Id}' not found.");

        var response = new PersonnelPositionResponse
        {
            Id = personnelPosition.Id,
            UserId = personnelPosition.UserId,
            PositionId = personnelPosition.PositionId,
            AssignmentType = personnelPosition.AssignmentType,
            IsActive = personnelPosition.IsActive,
            StartDate = personnelPosition.StartDate,
            EndDate = personnelPosition.EndDate,
            CreatedAt = personnelPosition.CreatedAt,
            CreatedBy = personnelPosition.CreatedBy,
            PositionTitle = personnelPosition.Position?.Title,
            PositionCode = personnelPosition.Position?.Code,
            User = personnelPosition.User != null ? new UserDto
            {
                Id = personnelPosition.User.Id,
                EmployeeNumber = personnelPosition.User.EmployeeNumber,
                Username = personnelPosition.User.Username,
                Email = personnelPosition.User.Email,
                FirstName = personnelPosition.User.FirstName,
                MiddleName = personnelPosition.User.MiddleName,
                LastName = personnelPosition.User.LastName,
                NameExtension = personnelPosition.User.NameExtension,
                FullName = personnelPosition.User.FullName,
                PhoneNumber = personnelPosition.User.PhoneNumber,
                EmploymentStatus = personnelPosition.User.EmploymentStatus,
                DateHired = personnelPosition.User.DateHired,
                DateSeparated = personnelPosition.User.DateSeparated,
                IsActive = personnelPosition.User.IsActive,
                OfficeId = personnelPosition.User.OfficeId,
                OfficeName = personnelPosition.User.Office?.Name
            } : null,
            Position = personnelPosition.Position != null ? new PositionDto
            {
                Id = personnelPosition.Position.Id,
                Title = personnelPosition.Position.Title,
                FunctionalTitle = personnelPosition.Position.FunctionalTitle,
                Code = personnelPosition.Position.Code,
                JobDescription = personnelPosition.Position.JobDescription,
                Qualifications = personnelPosition.Position.Qualifications,
                FTE = personnelPosition.Position.FTE,
                OperationalStatus = personnelPosition.Position.OperationalStatus,
                PositionTypeId = personnelPosition.Position.PositionTypeId,
                PlantillaTypeId = personnelPosition.Position.PlantillaTypeId,
                SalaryGradeId = personnelPosition.Position.SalaryGradeId,
                StepId = personnelPosition.Position.StepId,
                OfficeId = personnelPosition.Position.OfficeId,
                OfficeName = personnelPosition.Position.Office?.Name
            } : null
        };

        return ApiResponse<PersonnelPositionResponse>.Success(response);
    }
}
