using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.DeleteWFPOutcome;

public record class DeleteWFPOutcomeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
