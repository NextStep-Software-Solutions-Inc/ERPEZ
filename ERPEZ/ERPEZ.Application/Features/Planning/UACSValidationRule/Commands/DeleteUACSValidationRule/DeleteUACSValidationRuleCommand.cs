using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSValidationRule.Commands.DeleteUACSValidationRule;

public record DeleteUACSValidationRuleCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
