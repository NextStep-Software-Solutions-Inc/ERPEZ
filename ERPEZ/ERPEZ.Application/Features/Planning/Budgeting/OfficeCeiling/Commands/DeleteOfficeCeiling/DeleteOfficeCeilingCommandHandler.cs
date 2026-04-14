using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Commands.DeleteOfficeCeiling;

public class DeleteOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOfficeCeilingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OfficeCeilingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Office Ceiling with ID {command.Id} not found.");

        unitOfWork.OfficeCeilingRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Office Ceiling deleted successfully.");
    }
}

