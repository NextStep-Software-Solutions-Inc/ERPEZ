using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.DeleteMarketScoping;

public class DeleteMarketScopingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteMarketScopingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMarketScopingCommand command, CancellationToken cancellationToken)
    {
        var marketScoping = await unitOfWork.MarketScopingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Market scoping with ID {command.Id} not found.");

        unitOfWork.MarketScopingRepository.Remove(marketScoping);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new ApiResponse<Unit>
        {
            Succeeded = true,
            Data = Unit.Value,
            Message = "Market scoping deleted successfully."
        };
    }
}
