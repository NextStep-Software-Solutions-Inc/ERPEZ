using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SDG.Commands.DeleteSDG;

public class DeleteSDGCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
}
