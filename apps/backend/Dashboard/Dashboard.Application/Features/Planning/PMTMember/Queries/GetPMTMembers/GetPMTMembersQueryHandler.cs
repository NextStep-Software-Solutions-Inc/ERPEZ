using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMembers;

public class GetPMTMembersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPMTMembersQuery, PaginatedApiResponse<PMTMemberResponse>>
{
    public async Task<PaginatedApiResponse<PMTMemberResponse>> Handle(GetPMTMembersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.PMTMember, PMTMemberResponse>> projection = pm => new PMTMemberResponse
        {
            Id = pm.Id,
            PMTId = pm.PMTId,
            UserId = pm.UserId,
            Role = pm.Role,
            AppointmentDate = pm.AppointmentDate,
            EndDate = pm.EndDate,
            IsActive = pm.IsActive,
            CreatedAt = pm.CreatedAt,
            CreatedBy = pm.CreatedBy,
            PMT = pm.PMT != null ? new PMTDto
            {
                Id = pm.PMT.Id,
                OrganizationId = pm.PMT.OrganizationId,
                ActiveYear = pm.PMT.ActiveYear,
                IsManualWorkflow = pm.PMT.IsManualWorkflow,
                IsActive = pm.PMT.IsActive,
                OrganizationName = pm.PMT.Organization != null ? pm.PMT.Organization.Name : null,
                OrganizationCode = pm.PMT.Organization != null ? pm.PMT.Organization.Code : null
            } : null,
            User = pm.User != null ? new UserDto
            {
                Id = pm.User.Id,
                EmployeeNumber = pm.User.EmployeeNumber,
                Username = pm.User.Username,
                Email = pm.User.Email,
                FirstName = pm.User.FirstName,
                MiddleName = pm.User.MiddleName,
                LastName = pm.User.LastName,
                NameExtension = pm.User.NameExtension,
                FullName = pm.User.FullName,
                PhoneNumber = pm.User.PhoneNumber,
                EmploymentStatus = pm.User.EmploymentStatus,
                DateHired = pm.User.DateHired,
                DateSeparated = pm.User.DateSeparated,
                IsActive = pm.User.IsActive,
                OfficeId = pm.User.OfficeId,
                OfficeName = pm.User.Office != null ? pm.User.Office.Name : null
            } : null
        };

        var (pmtMembers, totalCount) = await unitOfWork.PMTMemberRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PMTMemberResponse>(
            [.. pmtMembers],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
