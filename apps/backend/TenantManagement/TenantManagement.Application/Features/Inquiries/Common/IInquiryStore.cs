namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Common;

public interface IInquiryStore
{
    // Synchronous contracts for backwards compatibility
    void AddQuote(QuoteInquiryDto quote);
    void AddDemo(DemoInquiryDto demo);
    void AddSubscriber(SubscriberInquiryDto subscriber);
    IReadOnlyList<QuoteInquiryDto> GetQuotes();
    IReadOnlyList<DemoInquiryDto> GetDemos();
    IReadOnlyList<SubscriberInquiryDto> GetSubscribers();
    InquiriesSummaryDto GetSummary();

    // Asynchronous non-blocking contracts for database persistence
    Task AddQuoteAsync(QuoteInquiryDto quote, CancellationToken cancellationToken = default);
    Task AddDemoAsync(DemoInquiryDto demo, CancellationToken cancellationToken = default);
    Task AddSubscriberAsync(SubscriberInquiryDto subscriber, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QuoteInquiryDto>> GetQuotesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DemoInquiryDto>> GetDemosAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SubscriberInquiryDto>> GetSubscribersAsync(CancellationToken cancellationToken = default);
    Task<InquiriesSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<InquiriesSummaryDto> GetSummaryAsync(string? inquiryType = null, string? status = null, string? search = null, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(string referenceCode, string newStatus, string? notes = null, string? assignedTo = null, CancellationToken cancellationToken = default);
}
