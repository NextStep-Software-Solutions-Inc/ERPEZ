using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;

public record class DeleteMFOPAPCommand(Guid Id) : IRequest<ApiResponse<Unit>>;