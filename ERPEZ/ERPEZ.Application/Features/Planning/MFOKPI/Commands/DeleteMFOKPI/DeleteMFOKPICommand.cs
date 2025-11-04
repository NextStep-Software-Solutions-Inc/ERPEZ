using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.DeleteMFOKPI;

public record class DeleteMFOKPICommand(Guid Id) : IRequest<ApiResponse<Unit>>;