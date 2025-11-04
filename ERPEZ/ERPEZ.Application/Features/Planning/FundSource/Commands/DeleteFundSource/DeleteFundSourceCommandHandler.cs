using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.DeleteFundSource;

public class DeleteFundSourceCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteFundSourceCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteFundSourceCommand request, CancellationToken cancellationToken)
    {
        var fundSource = await unitOfWork.FundSourceRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Fund Source not found.");

        unitOfWork.FundSourceRepository.Remove(fundSource);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Fund Source with ID {request.Id} deleted successfully.");
    }
}
