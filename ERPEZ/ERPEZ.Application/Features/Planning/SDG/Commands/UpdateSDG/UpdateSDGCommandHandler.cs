using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.UpdateSDG;

public class UpdateSDGCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateSDGCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSDGCommand request, CancellationToken cancellationToken)
    {
        var sdg = await unitOfWork.SDGRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"SDG with ID {request.Id} not found.");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            var existingSDG = await unitOfWork.SDGRepository.FindAsync(x => x.Name == request.Name && x.Id != request.Id, cancellationToken);
            if (existingSDG != null)
            {
                throw new ConflictException($"SDG with name '{request.Name}' already exists.");
            }
            sdg.Name = request.Name;
        }

        if (request.Description != null)
        {
            sdg.Description = request.Description;
        }

        unitOfWork.SDGRepository.Update(sdg);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "SDG updated successfully.");
    }
}
