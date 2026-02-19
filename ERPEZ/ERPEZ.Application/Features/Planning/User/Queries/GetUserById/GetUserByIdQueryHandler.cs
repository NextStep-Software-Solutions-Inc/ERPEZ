using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.User.Queries.GetUserById;

public class GetUserByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUserByIdQuery, ApiResponse<UserResponse>>
{
    public async Task<ApiResponse<UserResponse>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.UserRepository
            .Query()
            .Include(u => u.Office)
            .FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);

        if (user == null)
            throw new NotFoundException($"User with ID '{request.Id}' not found.");

        var response = new UserResponse
        {
            Id = user.Id,
            EmployeeNumber = user.EmployeeNumber,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            NameExtension = user.NameExtension,
            PhoneNumber = user.PhoneNumber,
            EmploymentStatus = user.EmploymentStatus,
            DateHired = user.DateHired,
            DateSeparated = user.DateSeparated,
            IsActive = user.IsActive,
            OfficeId = user.OfficeId,
            OfficeName = user.Office?.Name,
            OfficeCode = user.Office?.Code,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            CreatedBy = user.CreatedBy
        };

        return ApiResponse<UserResponse>.Success(response);
    }
}
