using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.CreateBACResolutionWhereasClause;

public class CreateBACResolutionWhereasClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateBACResolutionWhereasClauseCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateBACResolutionWhereasClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = new Domain.Entities.Planning.BACResolutionWhereasClause
        {
            Name = request.Name,
            Body = request.Body
        };

        await unitOfWork.BACResolutionWhereasClauseRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "BAC resolution whereas clause created successfully.");
    }
}
