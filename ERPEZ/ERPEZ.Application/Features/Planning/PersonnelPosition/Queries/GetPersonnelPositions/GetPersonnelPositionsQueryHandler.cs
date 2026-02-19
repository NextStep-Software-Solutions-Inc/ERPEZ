using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositions;

public class GetPersonnelPositionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPersonnelPositionsQuery, PaginatedApiResponse<PersonnelPositionResponse>>
{
    public async Task<PaginatedApiResponse<PersonnelPositionResponse>> Handle(GetPersonnelPositionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PersonnelPosition, PersonnelPositionResponse>> projection = pp => new PersonnelPositionResponse
        {
            Id = pp.Id,
            UserId = pp.UserId,
            PositionId = pp.PositionId,
            AssignmentType = pp.AssignmentType,
            IsActive = pp.IsActive,
            StartDate = pp.StartDate,
            EndDate = pp.EndDate,
            CreatedAt = pp.CreatedAt,
            CreatedBy = pp.CreatedBy,
            PositionTitle = pp.Position != null ? pp.Position.Title : null,
            PositionCode = pp.Position != null ? pp.Position.Code : null,
            User = pp.User != null ? new UserDto
            {
                Id = pp.User.Id,
                EmployeeNumber = pp.User.EmployeeNumber,
                Username = pp.User.Username,
                Email = pp.User.Email,
                FirstName = pp.User.FirstName,
                MiddleName = pp.User.MiddleName,
                LastName = pp.User.LastName,
                NameExtension = pp.User.NameExtension,
                FullName = pp.User.FullName,
                PhoneNumber = pp.User.PhoneNumber,
                EmploymentStatus = pp.User.EmploymentStatus,
                DateHired = pp.User.DateHired,
                DateSeparated = pp.User.DateSeparated,
                IsActive = pp.User.IsActive,
                OfficeId = pp.User.OfficeId,
                OfficeName = pp.User.Office != null ? pp.User.Office.Name : null
            } : null,
            Position = pp.Position != null ? new PositionDto
            {
                Id = pp.Position.Id,
                Title = pp.Position.Title,
                FunctionalTitle = pp.Position.FunctionalTitle,
                Code = pp.Position.Code,
                JobDescription = pp.Position.JobDescription,
                Qualifications = pp.Position.Qualifications,
                FTE = pp.Position.FTE,
                OperationalStatus = pp.Position.OperationalStatus,
                PositionTypeId = pp.Position.PositionTypeId,
                PlantillaTypeId = pp.Position.PlantillaTypeId,
                SalaryGradeId = pp.Position.SalaryGradeId,
                StepId = pp.Position.StepId,
                OfficeId = pp.Position.OfficeId,
                OfficeName = pp.Position.Office != null ? pp.Position.Office.Name : null
            } : null
        };

        var (personnelPositions, totalCount) = await unitOfWork.PersonnelPositionRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PersonnelPositionResponse>(
            [.. personnelPositions],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
