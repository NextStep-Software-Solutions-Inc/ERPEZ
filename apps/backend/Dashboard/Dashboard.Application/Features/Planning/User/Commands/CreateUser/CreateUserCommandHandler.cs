using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.User.Commands.CreateUser;

public class CreateUserCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateUserCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Check Employee Number uniqueness
        var employeeNumberExists = await unitOfWork.UserRepository.EmployeeNumberExistsAsync(
            request.EmployeeNumber,
            cancellationToken
        );

        if (employeeNumberExists)
            throw new ConflictException($"Employee Number '{request.EmployeeNumber}' already exists.");

        // Check Username uniqueness
        var usernameExists = await unitOfWork.UserRepository.UsernameExistsAsync(
            request.Username,
            cancellationToken
        );

        if (usernameExists)
            throw new ConflictException($"Username '{request.Username}' already exists.");

        // Check Email uniqueness
        var emailExists = await unitOfWork.UserRepository.EmailExistsAsync(
            request.Email,
            cancellationToken
        );

        if (emailExists)
            throw new ConflictException($"Email '{request.Email}' already exists.");

        // Validate Office if provided
        if (request.OfficeId.HasValue)
        {
            var office = await unitOfWork.OfficeRepository.GetByIdAsync(
                request.OfficeId.Value,
                cancellationToken
            );

            if (office == null)
                throw new NotFoundException($"Office with ID '{request.OfficeId}' not found.");
        }

        // Create entity
        var user = new Domain.Entities.Planning.User
        {
            Id = Guid.NewGuid(),
            EmployeeNumber = request.EmployeeNumber,
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            NameExtension = request.NameExtension,
            PhoneNumber = request.PhoneNumber,
            EmploymentStatus = request.EmploymentStatus,
            DateHired = request.DateHired,
            IsActive = request.IsActive,
            OfficeId = request.OfficeId
        };

        await unitOfWork.UserRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(user.Id);
    }
}
