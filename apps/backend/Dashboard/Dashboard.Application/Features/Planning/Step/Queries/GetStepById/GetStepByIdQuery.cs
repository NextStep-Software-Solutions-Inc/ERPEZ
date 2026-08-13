using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Queries.GetStepById;

public record GetStepByIdQuery(Guid Id) : IRequest<ApiResponse<StepResponse>>;
