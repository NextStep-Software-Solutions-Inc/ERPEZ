using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTById;

public class GetPMTByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPMTByIdQuery, ApiResponse<PMTResponse>>
{
    public async Task<ApiResponse<PMTResponse>> Handle(GetPMTByIdQuery request, CancellationToken cancellationToken)
    {
        var pmt = await unitOfWork.PMTRepository
            .GetByIdWithIncludesAsync(request.Id, cancellationToken);

        if (pmt == null)
            throw new NotFoundException($"PMT with ID '{request.Id}' not found.");

        var response = new PMTResponse
        {
            Id = pmt.Id,
            OrganizationId = pmt.OrganizationId,
            OrganizationName = pmt.Organization?.Name,
            OrganizationCode = pmt.Organization?.Code,
            ActiveYear = pmt.ActiveYear,
            IsManualWorkflow = pmt.IsManualWorkflow,
            IsActive = pmt.IsActive,
            CreatedAt = pmt.CreatedAt,
            CreatedBy = pmt.CreatedBy,
            PMTMembers = pmt.PMTMembers?.Select(pm => new PMTMemberResponse
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
                    OfficeName = pm.User.Office?.Name
                } : null
            }).ToList() ?? []
        };

        return ApiResponse<PMTResponse>.Success(response);
    }
}
