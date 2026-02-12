using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.ArchiveProcurementMode;

public record ArchiveProcurementModeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
