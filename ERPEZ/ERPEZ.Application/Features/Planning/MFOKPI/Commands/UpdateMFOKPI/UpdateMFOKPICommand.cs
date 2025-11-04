using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.UpdateMFOKPI;

public class UpdateMFOKPICommand : IRequest<ApiResponse<Domain.Entities.Planning.MFOKPI>>
{
    public Guid Id { get; set; }
    public required UpdateMFOKPIDto UpdateMFOKPI { get; set; }
}

