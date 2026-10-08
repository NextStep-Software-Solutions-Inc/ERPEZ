namespace ERPEZ.TenantManagement.Application.Features.Inquiries.Common;

public interface IInquiryStore
{
    void AddQuote(QuoteInquiryDto quote);
    void AddDemo(DemoInquiryDto demo);
    void AddSubscriber(SubscriberInquiryDto subscriber);
    IReadOnlyList<QuoteInquiryDto> GetQuotes();
    IReadOnlyList<DemoInquiryDto> GetDemos();
    IReadOnlyList<SubscriberInquiryDto> GetSubscribers();
    InquiriesSummaryDto GetSummary();
}
