using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.UpdateAccount;

public class UpdateAccountCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateAccountCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await unitOfWork.AccountRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Account with ID {request.Id} not found.");

        var trimmedName = request.Name.Trim();
        if (trimmedName.Length == 0)
        {
            throw new BadRequestException("Account name cannot be empty or whitespace.");
        }

        account.Name = trimmedName;
        unitOfWork.AccountRepository.Update(account);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Account updated successfully.");
    }
}
