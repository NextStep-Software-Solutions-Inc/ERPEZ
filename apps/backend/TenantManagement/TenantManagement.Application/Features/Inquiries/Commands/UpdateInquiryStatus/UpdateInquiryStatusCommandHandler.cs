using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Commands.UpdateInquiryStatus;

public class UpdateInquiryStatusCommandHandler(
    ILogger<UpdateInquiryStatusCommandHandler> logger,
    IInquiryStore inquiryStore)
    : IRequestHandler<UpdateInquiryStatusCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateInquiryStatusCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.ReferenceCode))
        {
            return ApiResponse<bool>.Fail("Reference code is required.");
        }

        if (string.IsNullOrWhiteSpace(command.Status))
        {
            return ApiResponse<bool>.Fail("Status is required.");
        }

        try
        {
            var updated = await inquiryStore.UpdateStatusAsync(
                command.ReferenceCode.Trim(),
                command.Status.Trim(),
                command.Notes,
                command.AssignedTo,
                cancellationToken);

            if (!updated)
            {
                return ApiResponse<bool>.Fail($"Inquiry with reference '{command.ReferenceCode}' was not found.");
            }

            logger.LogInformation(
                "Inquiry status updated: Reference={ReferenceCode}, NewStatus={Status}, AssignedTo={AssignedTo}",
                command.ReferenceCode, command.Status, command.AssignedTo);

            return ApiResponse<bool>.Success(true, $"Inquiry status successfully updated to '{command.Status}'.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update inquiry status for Reference={ReferenceCode}", command.ReferenceCode);
            return ApiResponse<bool>.Fail("Unable to update inquiry status at this time.");
        }
    }
}
