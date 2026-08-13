using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Queries.GetPMTMemberById;

public class GetPMTMemberByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPMTMemberByIdQuery, ApiResponse<PMTMemberResponse>>
{
    public async Task<ApiResponse<PMTMemberResponse>> Handle(GetPMTMemberByIdQuery request, CancellationToken cancellationToken)
    {
        var pmtMember = await unitOfWork.PMTMemberRepository
            .GetByIdWithIncludesAsync(request.Id, cancellationToken);

        if (pmtMember == null)
            throw new NotFoundException($"PMT Member with ID '{request.Id}' not found.");

        var response = new PMTMemberResponse
        {
            Id = pmtMember.Id,
            PMTId = pmtMember.PMTId,
            UserId = pmtMember.UserId,
            Role = pmtMember.Role,
            AppointmentDate = pmtMember.AppointmentDate,
            EndDate = pmtMember.EndDate,
            IsActive = pmtMember.IsActive,
            CreatedAt = pmtMember.CreatedAt,
            CreatedBy = pmtMember.CreatedBy,
            PMT = pmtMember.PMT != null ? new PMTDto
            {
                Id = pmtMember.PMT.Id,
                OrganizationId = pmtMember.PMT.OrganizationId,
                ActiveYear = pmtMember.PMT.ActiveYear,
                IsManualWorkflow = pmtMember.PMT.IsManualWorkflow,
                IsActive = pmtMember.PMT.IsActive,
                OrganizationName = pmtMember.PMT.Organization?.Name,
                OrganizationCode = pmtMember.PMT.Organization?.Code
            } : null,
            User = pmtMember.User != null ? new UserDto
            {
                Id = pmtMember.User.Id,
                EmployeeNumber = pmtMember.User.EmployeeNumber,
                Username = pmtMember.User.Username,
                Email = pmtMember.User.Email,
                FirstName = pmtMember.User.FirstName,
                MiddleName = pmtMember.User.MiddleName,
                LastName = pmtMember.User.LastName,
                NameExtension = pmtMember.User.NameExtension,
                FullName = pmtMember.User.FullName,
                PhoneNumber = pmtMember.User.PhoneNumber,
                EmploymentStatus = pmtMember.User.EmploymentStatus,
                DateHired = pmtMember.User.DateHired,
                DateSeparated = pmtMember.User.DateSeparated,
                IsActive = pmtMember.User.IsActive,
                OfficeId = pmtMember.User.OfficeId,
                OfficeName = pmtMember.User.Office?.Name
            } : null
        };

        return ApiResponse<PMTMemberResponse>.Success(response);
    }
}
