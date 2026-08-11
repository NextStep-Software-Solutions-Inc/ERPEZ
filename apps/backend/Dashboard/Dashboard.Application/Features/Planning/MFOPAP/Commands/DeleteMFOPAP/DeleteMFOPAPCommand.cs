using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;

public record DeleteMFOPAPCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
