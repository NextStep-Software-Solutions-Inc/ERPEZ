import { useState, useMemo } from "react";
import { createQueryHookFromTemplate } from "erpez-shared-lib";
import { PageContainer } from "~/components/PageContainer";
import { getInquiriesRequest } from "~/features/inquiry/handlers/getInquiriesRequest";
import type { QuoteInquiry, DemoInquiry, SubscriberInquiry } from "~/features/inquiry/type/Inquiry";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  FileText,
  Calendar,
  Mail,
  Search,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Building,
  User,
  Phone,
  ShieldCheck,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "~/components/LoadingSpinner";

const useInquiries = createQueryHookFromTemplate(getInquiriesRequest);

export default function InquiriesPage() {
  const [activeTab, setActiveTab] = useState<"quotes" | "demos" | "subscribers">("quotes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<QuoteInquiry | null>(null);

  const { data: response, isLoading, isFetching, refetch } = useInquiries({});

  const inquiriesData = response?.data;
  const quotes: QuoteInquiry[] = inquiriesData?.quotes ?? [];
  const demos: DemoInquiry[] = inquiriesData?.demos ?? [];
  const subscribers: SubscriberInquiry[] = inquiriesData?.subscribers ?? [];

  // Filtered lists
  const filteredQuotes = useMemo(() => {
    if (!searchTerm.trim()) return quotes;
    const term = searchTerm.toLowerCase();
    return quotes.filter(
      (q) =>
        q.referenceCode.toLowerCase().includes(term) ||
        q.contactName.toLowerCase().includes(term) ||
        q.email.toLowerCase().includes(term) ||
        (q.organizationName && q.organizationName.toLowerCase().includes(term)) ||
        q.planName.toLowerCase().includes(term) ||
        (q.scopeSummary && q.scopeSummary.toLowerCase().includes(term))
    );
  }, [quotes, searchTerm]);

  const filteredDemos = useMemo(() => {
    if (!searchTerm.trim()) return demos;
    const term = searchTerm.toLowerCase();
    return demos.filter(
      (d) =>
        d.referenceCode.toLowerCase().includes(term) ||
        d.contactName.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        (d.organizationName && d.organizationName.toLowerCase().includes(term)) ||
        (d.notes && d.notes.toLowerCase().includes(term)) ||
        d.preferredTimeSlot.toLowerCase().includes(term)
    );
  }, [demos, searchTerm]);

  const filteredSubscribers = useMemo(() => {
    if (!searchTerm.trim()) return subscribers;
    const term = searchTerm.toLowerCase();
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(term) ||
        s.source.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term)
    );
  }, [subscribers, searchTerm]);

  const copyToClipboard = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    }
  };

  const exportCurrentTabToCsv = () => {
    let csvContent = "";
    let filename = "";

    if (activeTab === "quotes") {
      filename = `quotes-${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ["Reference Code", "Contact Name", "Email", "Phone", "Organization", "Plan", "Deployment", "Modules", "Status", "Submitted At"];
      const rows = filteredQuotes.map((q) => [
        `"${q.referenceCode}"`,
        `"${q.contactName}"`,
        `"${q.email}"`,
        `"${q.phone || ""}"`,
        `"${q.organizationName || ""}"`,
        `"${q.planName}"`,
        `"${q.deploymentType || ""}"`,
        `"${q.requestedModules.join(", ")}"`,
        `"${q.status}"`,
        `"${q.submittedAtUtc}"`,
      ]);
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (activeTab === "demos") {
      filename = `demos-${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ["Reference Code", "Contact Name", "Email", "Phone", "Organization", "Target Date", "Time Slot", "Focus Topics", "Status", "Submitted At"];
      const rows = filteredDemos.map((d) => [
        `"${d.referenceCode}"`,
        `"${d.contactName}"`,
        `"${d.email}"`,
        `"${d.phone || ""}"`,
        `"${d.organizationName || ""}"`,
        `"${d.preferredDate}"`,
        `"${d.preferredTimeSlot}"`,
        `"${(d.notes || "").replace(/"/g, '""')}"`,
        `"${d.status}"`,
        `"${d.submittedAtUtc}"`,
      ]);
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      filename = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ["Email", "Source", "Status", "Subscribed At"];
      const rows = filteredSubscribers.map((s) => [
        `"${s.email}"`,
        `"${s.source}"`,
        `"${s.status}"`,
        `"${s.subscribedAtUtc}"`,
      ]);
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename}`);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("confirmed") || s.includes("active") || s.includes("approved")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          {status}
        </Badge>
      );
    }
    if (s.includes("review") || s.includes("pending")) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1 text-amber-600" />
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        {status}
      </Badge>
    );
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const totalLeads = quotes.length + demos.length + subscribers.length;

  return (
    <PageContainer
      title="Inquiries & Leads"
      description="Track, filter, and review commercial quote proposals, product demo bookings, and newsletter subscriptions."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCurrentTabToCsv}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </Button>
        </div>
      }
    >
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Total Inbound Leads
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-900 mt-1">
              {totalLeads}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              Live public form capture
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center justify-between">
              <span>Scope Quotes</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-700 mt-1">
              {quotes.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {quotes.filter((q) => q.status.toLowerCase().includes("review")).length} awaiting proposal
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center justify-between">
              <span>Demonstrations</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700 mt-1">
              {demos.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {demos.filter((d) => d.status.toLowerCase().includes("confirmed")).length} confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center justify-between">
              <span>Subscribers</span>
              <Mail className="w-4 h-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-indigo-700 mt-1">
              {subscribers.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              Release updates & newsletters
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs and Content */}
      <Tabs
        defaultValue="quotes"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
          <TabsList className="bg-slate-100 p-1 border border-slate-200 h-10 w-fit">
            <TabsTrigger value="quotes" className="gap-2 px-3">
              <FileText className="w-4 h-4" />
              <span>Quotes</span>
              <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 h-4">
                {quotes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="demos" className="gap-2 px-3">
              <Calendar className="w-4 h-4" />
              <span>Demos</span>
              <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 h-4">
                {demos.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2 px-3">
              <Mail className="w-4 h-4" />
              <span>Subscribers</span>
              <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 h-4">
                {subscribers.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" message="Loading inquiries and leads..." />
          </div>
        ) : (
          <>
            {/* QUOTES TAB */}
            <TabsContent value="quotes" className="m-0">
              <Card className="border border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/60 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-800">
                        Customized Scope Quote Requests
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Inbound scope configurations submitted from commercial tier landing modals
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredQuotes.length} record{filteredQuotes.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredQuotes.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No quote requests match your filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700 text-xs w-[180px]">Reference</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Contact & Organization</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Plan & Deployment</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Requested Modules</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Submitted</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700 text-xs">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQuotes.map((quote) => (
                            <TableRow key={quote.referenceCode} className="hover:bg-slate-50/80 transition-colors">
                              <TableCell className="font-mono text-xs font-medium text-slate-800">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(quote.referenceCode, "Reference Code")}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-[11px] transition-colors"
                                  title="Click to copy"
                                >
                                  {quote.referenceCode}
                                  <Copy className="w-3 h-3 text-slate-400" />
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-sm text-slate-900">{quote.contactName}</div>
                                  <div className="text-xs text-slate-600 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <a href={`mailto:${quote.email}`} className="hover:underline text-blue-600">
                                      {quote.email}
                                    </a>
                                  </div>
                                  {quote.organizationName && (
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <Building className="w-3 h-3 text-slate-400" />
                                      {quote.organizationName}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-xs text-slate-800 flex items-center gap-1.5">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {quote.planName}
                                    </Badge>
                                    {quote.teamSize && (
                                      <span className="text-[11px] text-slate-500">({quote.teamSize})</span>
                                    )}
                                  </div>
                                  {quote.deploymentType && (
                                    <p className="text-[11px] text-slate-500">
                                      {quote.deploymentType}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {quote.requestedModules.map((m) => (
                                    <Badge
                                      key={m}
                                      variant="secondary"
                                      className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0"
                                    >
                                      {m}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(quote.status)}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                                {formatDateTime(quote.submittedAtUtc)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedQuote(quote)}
                                  className="h-8 px-2.5 text-xs text-slate-700"
                                >
                                  View Scope
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* DEMOS TAB */}
            <TabsContent value="demos" className="m-0">
              <Card className="border border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/60 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-800">
                        Scheduled Product Demonstrations
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Requests for live solution walkthroughs, procurement modules, and budget planning
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredDemos.length} record{filteredDemos.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredDemos.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No demo bookings match your filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700 text-xs w-[180px]">Reference</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Requester Details</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Target Date & Time Slot</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Focus Topics & Notes</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Submitted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDemos.map((demo) => (
                            <TableRow key={demo.referenceCode} className="hover:bg-slate-50/80 transition-colors">
                              <TableCell className="font-mono text-xs font-medium text-slate-800">
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(demo.referenceCode, "Demo Reference")}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-[11px] transition-colors"
                                  title="Click to copy"
                                >
                                  {demo.referenceCode}
                                  <Copy className="w-3 h-3 text-slate-400" />
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-sm text-slate-900">{demo.contactName}</div>
                                  <div className="text-xs text-slate-600 flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <a href={`mailto:${demo.email}`} className="hover:underline text-blue-600">
                                      {demo.email}
                                    </a>
                                  </div>
                                  {demo.phone && (
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      {demo.phone}
                                    </div>
                                  )}
                                  {demo.organizationName && (
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <Building className="w-3 h-3 text-slate-400" />
                                      {demo.organizationName}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                    {demo.preferredDate}
                                  </div>
                                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {demo.preferredTimeSlot}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[320px]">
                                <p className="text-xs text-slate-700 italic line-clamp-2">
                                  "{demo.notes || "General system overview"}"
                                </p>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(demo.status)}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                                {formatDateTime(demo.submittedAtUtc)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SUBSCRIBERS TAB */}
            <TabsContent value="subscribers" className="m-0">
              <Card className="border border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/60 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-800">
                        Newsletter & Release Subscribers
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        Opt-in emails for platform updates, security patches, and regulatory compliance changes
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredSubscribers.length} record{filteredSubscribers.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredSubscribers.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No newsletter subscribers match your filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700 text-xs">Email Address</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Source</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-xs">Subscribed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSubscribers.map((subscriber) => (
                            <TableRow key={subscriber.email} className="hover:bg-slate-50/80 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-slate-400" />
                                  <a
                                    href={`mailto:${subscriber.email}`}
                                    className="font-medium text-sm text-blue-600 hover:underline"
                                  >
                                    {subscriber.email}
                                  </a>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                  {subscriber.source}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(subscriber.status)}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                                {formatDateTime(subscriber.subscribedAtUtc)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Quote Scope Detail Modal */}
      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Scope Proposal: {selectedQuote.referenceCode}
                </DialogTitle>
                {getStatusBadge(selectedQuote.status)}
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Submitted on {formatDateTime(selectedQuote.submittedAtUtc)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contact Name</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedQuote.contactName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Organization</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedQuote.organizationName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                  <a href={`mailto:${selectedQuote.email}`} className="text-blue-600 hover:underline mt-0.5 block font-medium">
                    {selectedQuote.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
                  <p className="text-slate-800 mt-0.5">{selectedQuote.phone || "N/A"}</p>
                </div>
              </div>

              {/* Plan & Deployment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tier Plan</p>
                  <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                    {selectedQuote.planName}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">User Scale</p>
                  <p className="text-slate-800 mt-1 font-medium">{selectedQuote.teamSize || "Standard"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Deployment</p>
                  <p className="text-slate-800 mt-1 font-medium">{selectedQuote.deploymentType || "Cloud SaaS"}</p>
                </div>
              </div>

              {/* Modules Included */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                  Requested Functional Modules
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedQuote.requestedModules.map((mod) => (
                    <Badge
                      key={mod}
                      className="px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-slate-800 text-white"
                    >
                      {mod === "pbms" ? "PBMS (Planning & Budget)" : mod === "ams" ? "AMS (Asset Management)" : mod === "pms" ? "PMS (Procurement)" : mod}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Scope Summary */}
              {selectedQuote.scopeSummary && (
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60">
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">
                    Scope Configuration Summary
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedQuote.scopeSummary}
                  </p>
                </div>
              )}

              {/* Estimated Delivery */}
              {selectedQuote.estimatedDelivery && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Fulfillment Timeline:</strong> {selectedQuote.estimatedDelivery}</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(selectedQuote.referenceCode, "Quote Reference")}
                className="gap-1.5 text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Reference</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedQuote(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
}
