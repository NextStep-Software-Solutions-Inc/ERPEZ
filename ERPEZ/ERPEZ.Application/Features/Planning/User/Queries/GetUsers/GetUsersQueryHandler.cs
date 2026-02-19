using ERPEZ.Application.Features.Planning.User.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.User.Queries.GetUsers;

public class GetUsersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUsersQuery, PaginatedApiResponse<UserResponse>>
{
    public async Task<PaginatedApiResponse<UserResponse>> Handle(GetUsersQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.User, UserResponse>> projection = u => new UserResponse
        {
            Id = u.Id,
            EmployeeNumber = u.EmployeeNumber,
            Username = u.Username,
            Email = u.Email,
            FirstName = u.FirstName,
            MiddleName = u.MiddleName,
            LastName = u.LastName,
            NameExtension = u.NameExtension,
            PhoneNumber = u.PhoneNumber,
            EmploymentStatus = u.EmploymentStatus,
            DateHired = u.DateHired,
            DateSeparated = u.DateSeparated,
            IsActive = u.IsActive,
            OfficeId = u.OfficeId,
            OfficeName = u.Office != null ? u.Office.Name : null,
            FullName = u.FullName,
            CreatedAt = u.CreatedAt,
            CreatedBy = u.CreatedBy
        };

        var (users, totalCount) = await unitOfWork.UserRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<UserResponse>(
            [.. users],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
