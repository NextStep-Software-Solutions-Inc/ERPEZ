using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Commands.DeleteSubOfficeCeiling;

public class DeleteSubOfficeCeilingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSubOfficeCeilingCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSubOfficeCeilingCommand command, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SubOfficeCeilingRepository.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException($"Sub-Office Ceiling with ID {command.Id} not found.");

        unitOfWork.SubOfficeCeilingRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Sub-Office Ceiling deleted successfully.");
    }
}

