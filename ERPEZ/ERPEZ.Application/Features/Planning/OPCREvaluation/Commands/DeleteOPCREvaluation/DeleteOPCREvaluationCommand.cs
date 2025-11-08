using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Commands.DeleteOPCREvaluation;

public record class DeleteOPCREvaluationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;