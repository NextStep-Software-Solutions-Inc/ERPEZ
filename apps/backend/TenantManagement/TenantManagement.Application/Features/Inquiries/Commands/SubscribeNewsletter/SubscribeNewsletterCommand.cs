using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.SubscribeNewsletter;

public record SubscribeNewsletterCommand : IRequest<ApiResponse<bool>>
{
    public string Email { get; init; } = string.Empty;
}
