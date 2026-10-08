using System.Collections.Concurrent;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;

namespace ERPEZ.TenantManagement.Infrastructure.Services;

public class InMemoryInquiryStore : IInquiryStore
{
    private readonly ConcurrentBag<QuoteInquiryDto> quotes = new();
    private readonly ConcurrentBag<DemoInquiryDto> demos = new();
    private readonly ConcurrentDictionary<string, SubscriberInquiryDto> subscribers = new(StringComparer.OrdinalIgnoreCase);

    public InMemoryInquiryStore()
    {
        // Pre-seed initial inquiries for demonstration and administrative review
        quotes.Add(new QuoteInquiryDto
        {
            ReferenceCode = "QT-20261008-7F3A9C",
            ContactName = "Maria Santos",
            Email = "m.santos@region7.gov.ph",
            Phone = "+63 917 123 4567",
            OrganizationName = "Department of Agriculture - Region VII",
            TeamSize = "16-50 users",
            PlanName = "Professional",
            Tier = "Professional",
            DeploymentType = "Cloud SaaS (Datacenter)",
            RequestedModules = ["ams", "pbms", "pms"],
            ScopeSummary = "Professional (16-50 users) with AMS, PBMS, PMS - Cloud SaaS",
            EstimatedDelivery = "Immediate workspace provisioning available upon confirmation",
            Status = "Under Review",
            SubmittedAtUtc = DateTime.UtcNow.AddHours(-3)
        });

        quotes.Add(new QuoteInquiryDto
        {
            ReferenceCode = "QT-20261007-9B1D4E",
            ContactName = "Col. Arturo Ramos",
            Email = "arturo.ramos@dnd.gov.ph",
            Phone = "+63 920 987 6543",
            OrganizationName = "Armed Forces Communications Bureau",
            TeamSize = "50-200 users",
            PlanName = "On-Premise Foundation",
            Tier = "Enterprise",
            DeploymentType = "Air-Gapped On-Premise",
            RequestedModules = ["ams", "pbms", "pms"],
            ScopeSummary = "Enterprise Air-Gapped Sovereign Deployment with Isolated DB Silo",
            EstimatedDelivery = "1-3 business days for offline license certificate generation",
            Status = "Pending Security Review",
            SubmittedAtUtc = DateTime.UtcNow.AddDays(-1)
        });

        demos.Add(new DemoInquiryDto
        {
            ReferenceCode = "DEMO-20261008-4E8C2A",
            ContactName = "Engr. David Tan",
            Email = "david.tan@dpwh.gov.ph",
            Phone = "+63 918 555 1212",
            OrganizationName = "DPWH Regional Engineering Office",
            PreferredDate = "2026-10-15",
            PreferredTimeSlot = "Morning (9:00 AM - 12:00 PM)",
            Notes = "Walkthrough of Project Procurement Management (PPMP/APP) and annual budgeting.",
            Status = "Confirmed",
            SubmittedAtUtc = DateTime.UtcNow.AddHours(-5)
        });

        demos.Add(new DemoInquiryDto
        {
            ReferenceCode = "DEMO-20261006-2A7F1B",
            ContactName = "Dr. Elena Cruz",
            Email = "elena.cruz@up.edu.ph",
            Phone = "+63 919 444 3322",
            OrganizationName = "University Research & Development Center",
            PreferredDate = "2026-10-18",
            PreferredTimeSlot = "Afternoon (1:00 PM - 5:00 PM)",
            Notes = "Demonstration of multi-office budget allocations and BAC resolution workflows.",
            Status = "Pending Confirmation",
            SubmittedAtUtc = DateTime.UtcNow.AddDays(-2)
        });

        var sub1 = new SubscriberInquiryDto
        {
            Email = "procurement.officer@cebu.gov.ph",
            Source = "Landing Page Footer",
            Status = "Active",
            SubscribedAtUtc = DateTime.UtcNow.AddDays(-3)
        };
        subscribers.TryAdd(sub1.Email, sub1);

        var sub2 = new SubscriberInquiryDto
        {
            Email = "it.director@makati.gov.ph",
            Source = "Landing Page Footer",
            Status = "Active",
            SubscribedAtUtc = DateTime.UtcNow.AddDays(-5)
        };
        subscribers.TryAdd(sub2.Email, sub2);
    }

    public void AddQuote(QuoteInquiryDto quote)
    {
        quotes.Add(quote);
    }

    public void AddDemo(DemoInquiryDto demo)
    {
        demos.Add(demo);
    }

    public void AddSubscriber(SubscriberInquiryDto subscriber)
    {
        subscribers[subscriber.Email] = subscriber;
    }

    public IReadOnlyList<QuoteInquiryDto> GetQuotes()
    {
        return quotes.OrderByDescending(q => q.SubmittedAtUtc).ToList();
    }

    public IReadOnlyList<DemoInquiryDto> GetDemos()
    {
        return demos.OrderByDescending(d => d.SubmittedAtUtc).ToList();
    }

    public IReadOnlyList<SubscriberInquiryDto> GetSubscribers()
    {
        return subscribers.Values.OrderByDescending(s => s.SubscribedAtUtc).ToList();
    }

    public InquiriesSummaryDto GetSummary()
    {
        return new InquiriesSummaryDto
        {
            Quotes = GetQuotes().ToList(),
            Demos = GetDemos().ToList(),
            Subscribers = GetSubscribers().ToList()
        };
    }
}
