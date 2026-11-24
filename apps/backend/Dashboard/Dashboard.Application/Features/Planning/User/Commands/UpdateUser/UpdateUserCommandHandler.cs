using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Commands.UpdateUser;

public class UpdateUserCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateUserCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.UserRepository.GetByIdAsync(request.Id, cancellationToken);

        if (user == null)
            throw new NotFoundException($"User with ID '{request.Id}' not found.");

        // Check Employee Number uniqueness if changed
        if (!string.IsNullOrEmpty(request.UpdateUser.EmployeeNumber) && 
            request.UpdateUser.EmployeeNumber != user.EmployeeNumber)
        {
            var employeeNumberExists = await unitOfWork.UserRepository.EmployeeNumberExistsAsync(
                request.UpdateUser.EmployeeNumber,
                cancellationToken
            );

            if (employeeNumberExists)
                throw new ConflictException($"Employee Number '{request.UpdateUser.EmployeeNumber}' already exists.");

            user.EmployeeNumber = request.UpdateUser.EmployeeNumber;
        }

        // Check Username uniqueness if changed
        if (!string.IsNullOrEmpty(request.UpdateUser.Username) && 
            request.UpdateUser.Username != user.Username)
        {
            var usernameExists = await unitOfWork.UserRepository.UsernameExistsAsync(
                request.UpdateUser.Username,
                cancellationToken
            );

            if (usernameExists)
                throw new ConflictException($"Username '{request.UpdateUser.Username}' already exists.");

            user.Username = request.UpdateUser.Username;
        }

        // Check Email uniqueness if changed
        if (!string.IsNullOrEmpty(request.UpdateUser.Email) && 
            request.UpdateUser.Email != user.Email)
        {
            var emailExists = await unitOfWork.UserRepository.EmailExistsAsync(
                request.UpdateUser.Email,
                cancellationToken
            );

            if (emailExists)
                throw new ConflictException($"Email '{request.UpdateUser.Email}' already exists.");

            user.Email = request.UpdateUser.Email;
        }

        // Check ExternalIdentityId uniqueness if changed
        if (!string.IsNullOrWhiteSpace(request.UpdateUser.ExternalIdentityId) &&
            request.UpdateUser.ExternalIdentityId != user.ExternalIdentityId)
        {
            var existingUser = await unitOfWork.UserRepository.GetByExternalIdentityIdAsync(
                request.UpdateUser.ExternalIdentityId,
                cancellationToken
            );

            if (existingUser != null && existingUser.Id != user.Id)
                throw new ConflictException($"External Identity ID '{request.UpdateUser.ExternalIdentityId}' already exists.");

            user.ExternalIdentityId = request.UpdateUser.ExternalIdentityId;
        }

        // Validate Office if provided
        if (request.UpdateUser.OfficeId.HasValue)
        {
            var office = await unitOfWork.OfficeRepository.GetByIdAsync(
                request.UpdateUser.OfficeId.Value,
                cancellationToken
            );

            if (office == null)
                throw new NotFoundException($"Office with ID '{request.UpdateUser.OfficeId}' not found.");

            user.OfficeId = request.UpdateUser.OfficeId.Value;
        }

        // Update fields
        if (!string.IsNullOrEmpty(request.UpdateUser.FirstName))
            user.FirstName = request.UpdateUser.FirstName;

        if (request.UpdateUser.MiddleName is not null)
            user.MiddleName = request.UpdateUser.MiddleName;

        if (!string.IsNullOrEmpty(request.UpdateUser.LastName))
            user.LastName = request.UpdateUser.LastName;

        if (request.UpdateUser.NameExtension is not null)
            user.NameExtension = request.UpdateUser.NameExtension;

        if (request.UpdateUser.PhoneNumber is not null)
            user.PhoneNumber = request.UpdateUser.PhoneNumber;

        if (!string.IsNullOrEmpty(request.UpdateUser.EmploymentStatus))
            user.EmploymentStatus = request.UpdateUser.EmploymentStatus;

        if (request.UpdateUser.DateHired.HasValue)
            user.DateHired = request.UpdateUser.DateHired;

        if (request.UpdateUser.DateSeparated.HasValue)
            user.DateSeparated = request.UpdateUser.DateSeparated;

        if (request.UpdateUser.IsActive.HasValue)
            user.IsActive = request.UpdateUser.IsActive.Value;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
