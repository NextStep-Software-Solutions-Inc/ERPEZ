using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Finance.Commands.DeleteAccount;

public class DeleteAccountCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteAccountCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await unitOfWork.AccountRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Account with ID {request.Id} not found.");

        if (account.Balance != 0m || account.RunningBalance != 0m)
        {
            throw new BadRequestException("Account with a non-zero balance cannot be deleted.");
        }

        unitOfWork.AccountRepository.Remove(account);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Account deleted successfully.");
    }
}
