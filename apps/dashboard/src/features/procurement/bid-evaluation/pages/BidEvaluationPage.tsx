import { useState } from 'react';
import { RefreshCw, CheckCircle2, ChevronRight, AlertTriangle, FileCheck2, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBidEvaluationStore } from '../store/bidEvaluationStore';
import { getSortedSuppliers, BIDDER_SLA_DAYS, RA_9184_BAC_DAYS, RA_12009_BAC_DAYS } from '../data/mockProjects';
import { SlaTimerBadge } from '../components/SlaTimerBadge';
import { AuditLogTooltip } from '../components/AuditLogTooltip';
import { BacResolutionModal } from '../components/BacResolutionModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function BidEvaluationPage() {
  const {
    projects,
    selectedProjectId,
    selectProject,
    sendNoticeOfLcb,
    logDocsReceived,
    setPostQualResult,
    recommendForAward,
    resetProject,
  } = useBidEvaluationStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === selectedProjectId) ?? projects[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val);
  };

  if (!activeProject) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Sort suppliers based on LCRB (lowest financial bid) or MEARB (weighted Quality-Price scores)
  const sortedSuppliers = getSortedSuppliers(
    activeProject.suppliers,
    activeProject.awardCriterion,
    activeProject.technicalWeight,
    activeProject.financialWeight
  );

  // 2. Cascade Locking Logic
  // Actions are unlocked only for the highest-ranked supplier who is not disqualified.
  // Lower rows are locked to prevent out-of-order evaluations.
  const activeIndex = sortedSuppliers.findIndex((s) => s.status !== 'Disqualified');

  // 3. Check for overdue SLA timers to render non-dismissable warnings
  const checkOverdueTimers = () => {
    const nowMs = Date.now();
    const overdueList: { supplierName: string; type: 'Bidder' | 'BAC'; days: number }[] = [];

    activeProject.suppliers.forEach((sup) => {
      if (sup.status === 'LCB_Notified' && sup.lcbNoticeSentDate) {
        const startMs = new Date(sup.lcbNoticeSentDate).getTime();
        const limitMs = BIDDER_SLA_DAYS * 24 * 60 * 60 * 1000;
        if (nowMs > startMs + limitMs) {
          overdueList.push({ supplierName: sup.supplierName, type: 'Bidder', days: BIDDER_SLA_DAYS });
        }
      } else if (sup.status === 'Under_PostQual' && sup.postQualDocsReceivedDate) {
        const limitDays = activeProject.governingLaw === 'RA_9184' ? RA_9184_BAC_DAYS : RA_12009_BAC_DAYS;
        const startMs = new Date(sup.postQualDocsReceivedDate).getTime();
        const limitMs = limitDays * 24 * 60 * 60 * 1000;
        if (nowMs > startMs + limitMs) {
          overdueList.push({ supplierName: sup.supplierName, type: 'BAC', days: limitDays });
        }
      }
    });

    return overdueList;
  };

  const overdueTimers = checkOverdueTimers();

  const handleRecommend = () => {
    recommendForAward(activeProject.id);
    setIsModalOpen(true);
  };

  const hasPassedSupplier = activeProject.suppliers.some((s) => s.status === 'LCRB');
  const showRecommendButton = hasPassedSupplier && activeProject.projectStatus === 'Active';

  return (
    <div className="w-full space-y-6">
      
      {/* 1. HEADER CARD (Procurement Library styling as the reference) */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
        <CardHeader className="py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-default-900">
                Bid Evaluation & Post-Qualification
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-3xl">
                Workspace to rank bids, track dual post-qualification SLAs, handle disqualification cascades, and generate the BAC Resolution.
              </CardDescription>
            </div>
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary-700 bg-primary/5 shadow-sm">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> Evaluation Dashboard
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 2. PROJECT SELECTOR CARD (Clean workspace below the header card) */}
      <Card className="border border-default-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
        <CardHeader className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold text-default-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Project Workspace
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select a public bidding project to evaluate bids and track post-qualification progress.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-default-800 whitespace-nowrap">Active Project:</span>
            <Select value={activeProject.id} onValueChange={selectProject}>
              <SelectTrigger className="w-[380px] bg-white text-default-900 border-default-300 hover:border-default-400 shadow-sm focus:ring-2 focus:ring-primary/20 h-10 transition-colors">
                <SelectValue placeholder="Choose project..." />
              </SelectTrigger>
              <SelectContent className="max-w-[450px]">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-semibold text-primary">{p.resolutionNumber}</span> - {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => resetProject(activeProject.id)}
              title="Reset Project State"
              className="bg-default-50 hover:bg-default-100 border-default-250 hover:border-default-300 text-default-600 h-10 w-10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 3. NON-DISMISSABLE COMPLIANCE WARNING BANNER */}
      {overdueTimers.length > 0 && (
        <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-5 w-5 text-destructive animate-bounce" />
          <div>
            <AlertTitle className="font-bold text-sm text-destructive-900">🚨 COMPLIANCE ALERT: SLA Timer Overdue</AlertTitle>
            <AlertDescription className="text-xs text-destructive-800 mt-1 space-y-1">
              {overdueTimers.map((t, idx) => (
                <p key={idx}>
                  The <strong>{t.type} SLA</strong> timer for bidder <strong>{t.supplierName}</strong> has exceeded the legal threshold of <strong>{t.days} calendar days</strong>. 
                  This compliance exception has been logged to the audit trail for Commission on Audit (COA) review.
                </p>
              ))}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* 4. PROJECT HEADS & STATE BRIEF (With premium left accent borders) */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Governing Law */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-blue-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {activeProject.governingLaw === 'RA_9184' ? 'RA 9184' : 'RA 12009'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              BAC SLA: <span className="font-semibold text-blue-600">{activeProject.governingLaw === 'RA_9184' ? '12 Days' : '10 Days'}</span>
            </p>
          </CardContent>
        </Card>

        {/* Award Criterion */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-purple-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Award Criterion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {activeProject.awardCriterion === 'LCRB' ? 'LCRB (Lowest Price)' : 'MEARB (Weighted Total)'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeProject.awardCriterion === 'MEARB' 
                ? `Split: ${activeProject.technicalWeight}% Tech / ${activeProject.financialWeight}% Fin` 
                : 'Criteria: Lowest Financial Bid'}
            </p>
          </CardContent>
        </Card>

        {/* Approved Budget (ABC) */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-amber-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Approved Budget (ABC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              {formatCurrency(activeProject.abc)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Maximum allowable contract budget
            </p>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className={`border border-default-200 shadow-sm bg-white border-l-4 hover:translate-y-[-2px] transition-all duration-200 ${
          activeProject.projectStatus === 'Active' 
            ? 'border-l-info' 
            : activeProject.projectStatus === 'Pending_HoPE_Approval' 
            ? 'border-l-warning' 
            : 'border-l-success'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge 
                variant="outline" 
                color={
                  activeProject.projectStatus === 'Active' 
                    ? 'info' 
                    : activeProject.projectStatus === 'Pending_HoPE_Approval' 
                    ? 'warning' 
                    : 'success'
                } 
                className="font-bold"
              >
                {activeProject.projectStatus === 'Active' 
                  ? 'Active Evaluation' 
                  : activeProject.projectStatus === 'Pending_HoPE_Approval' 
                  ? 'Pending HoPE Approval' 
                  : 'Approved'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {activeProject.projectStatus === 'Active' 
                ? 'Evaluation & post-qual phase' 
                : activeProject.projectStatus === 'Pending_HoPE_Approval'
                ? 'Recommended for Award'
                : 'Resolution signed & approved'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. HAPPY PATH RESOLUTION ALERT BLOCK */}
      {(activeProject.projectStatus === 'Pending_HoPE_Approval' || activeProject.projectStatus === 'Approved') && activeProject.bacResolutionDraft && (
        <Card className="border border-success/30 bg-success/5 shadow-sm border-l-4 border-l-success overflow-hidden relative animate-in fade-in slide-in-from-left-2">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <CheckCircle2 className="h-24 w-24 text-success" />
          </div>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base text-success-950 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  {activeProject.projectStatus === 'Approved' 
                    ? 'BAC Resolution signed & approved!' 
                    : 'BAC Resolution Generated successfully!'}
                </CardTitle>
                <CardDescription className="text-success-800 text-xs">
                  {activeProject.projectStatus === 'Approved' 
                    ? 'Official recommendation approved by Head of Procuring Entity (HoPE).' 
                    : 'Recommendation of award submitted for Head of Procuring Entity (HoPE) signature.'}
                </CardDescription>
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-success text-white hover:bg-success/90 font-semibold shadow-md">
                <FileText className="h-4 w-4" /> View / Print {activeProject.projectStatus === 'Approved' ? 'Approved' : 'Draft'} Resolution
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-xs space-y-2 border-t border-success/15 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-success-850">
              <div>
                <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">Resolution No.</span>
                <span className="font-bold text-default-900 text-sm">{activeProject.bacResolutionDraft.resolutionNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">Winning Supplier</span>
                <span className="font-bold text-default-900 text-sm">{activeProject.bacResolutionDraft.winningSupplier}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">Awarded Amount</span>
                <span className="font-bold text-default-900 text-sm">{formatCurrency(activeProject.bacResolutionDraft.lcrbAmount)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">Drafted Date</span>
                <span className="font-bold text-default-900 text-sm">
                  {new Date(activeProject.bacResolutionDraft.draftedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. MAIN SUPPLIER WORKSPACE TABLE */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-default-100 bg-default-50/50">
          <div>
            <CardTitle className="text-base font-bold text-default-900">Bid Evaluation and Ranking Table</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {activeProject.awardCriterion === 'LCRB'
                ? 'Suppliers sorted strictly by lowest financial bid.'
                : 'Suppliers ranked using the MEARB weighted score formula. Normalized financial score (lowest bid/bid * 100) + quality technical score.'}
            </CardDescription>
          </div>
          {showRecommendButton && (
            <Button size="lg" className="bg-success hover:bg-success/90 text-white font-bold gap-2 shadow-md animate-bounce" onClick={handleRecommend}>
              <CheckCircle2 className="h-5 w-5" /> Recommend for Award
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-default-50/70">
              <TableRow>
                <TableHead className="w-[100px] font-bold text-default-900">Rank</TableHead>
                <TableHead className="font-bold text-default-900">Supplier Name</TableHead>
                <TableHead className="font-bold text-default-900">Financial Bid</TableHead>
                {activeProject.awardCriterion === 'MEARB' && (
                  <>
                    <TableHead className="font-bold text-default-900">Fin Score (Norm.)</TableHead>
                    <TableHead className="font-bold text-default-900">Tech Score</TableHead>
                    <TableHead className="font-bold text-default-900 bg-primary/5">Weighted Total</TableHead>
                  </>
                )}
                <TableHead className="font-bold text-default-900">Status</TableHead>
                <TableHead className="font-bold text-default-900">Active SLA Timer</TableHead>
                <TableHead className="w-[240px] text-right font-bold text-default-900">Workspace Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSuppliers.map((bid, index) => {
                const isActive = activeIndex === index && activeProject.projectStatus === 'Active';
                const isDisqualified = bid.status === 'Disqualified';
                const isWinner = bid.status === 'LCRB';
                const isRowLocked = !isActive && !isDisqualified && !isWinner;

                return (
                  <TableRow
                    key={bid.supplierId}
                    className={`transition-colors duration-150 ${
                      isDisqualified
                        ? 'opacity-40 bg-default-50/50 cursor-not-allowed select-none line-through'
                        : isWinner
                        ? 'bg-success/5 border-l-4 border-l-success hover:bg-success/10'
                        : isActive
                        ? 'bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10'
                        : 'text-default-500 hover:bg-default-50/50'
                    }`}
                  >
                    {/* Rank Badge */}
                    <TableCell className="font-bold">
                      {isDisqualified ? (
                        <span className="text-gray-400 font-medium italic">Disqualified</span>
                      ) : bid.computedRank === 1 ? (
                        <Badge color="success" className="font-bold border border-success/30 shadow-sm px-2 py-0.5">
                          1st ({activeProject.awardCriterion === 'LCRB' ? 'LCB' : 'MEARB'})
                        </Badge>
                      ) : bid.computedRank === 2 ? (
                        <Badge color="info" className="font-bold border border-info/30 px-2 py-0.5">
                          2nd
                        </Badge>
                      ) : (
                        <Badge color="secondary" className="font-bold border border-default-250 px-2 py-0.5">
                          {bid.computedRank}rd
                        </Badge>
                      )}
                    </TableCell>

                    {/* Supplier Name */}
                    <TableCell className="font-semibold text-default-950">
                      {bid.supplierName}
                    </TableCell>

                    {/* Financial Bid */}
                    <TableCell className="font-mono text-default-900 font-medium">
                      {formatCurrency(bid.financialBid)}
                    </TableCell>

                    {/* MEARB metrics columns */}
                    {activeProject.awardCriterion === 'MEARB' && (
                      <>
                        <TableCell className="font-mono text-default-700 font-medium">{bid.normalizedFinancialScore ?? 0} pts</TableCell>
                        <TableCell className="font-mono text-default-700 font-medium">{bid.technicalScore ?? 0} pts</TableCell>
                        <TableCell className="font-mono font-extrabold text-primary-700 bg-primary/5">
                          {bid.totalScore}%
                        </TableCell>
                      </>
                    )}

                    {/* Status Badge & audit tooltip */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          color={
                            isDisqualified
                              ? 'destructive'
                              : isWinner
                              ? 'success'
                              : bid.status === 'LCB_Notified'
                              ? 'warning'
                              : bid.status === 'Under_PostQual'
                              ? 'info'
                              : 'secondary'
                          }
                          className="capitalize font-bold px-2 py-0.5 shadow-sm"
                        >
                          {bid.status === 'LCB_Notified'
                            ? 'LCB Notified'
                            : bid.status === 'Under_PostQual'
                            ? 'Docs Received'
                            : bid.status === 'LCRB'
                            ? 'LCRB (Passed)'
                            : bid.status}
                        </Badge>
                        <AuditLogTooltip
                          complianceEvents={bid.complianceEvents}
                          lcbNoticeSentDate={bid.lcbNoticeSentDate}
                          postQualDocsReceivedDate={bid.postQualDocsReceivedDate}
                        />
                      </div>
                    </TableCell>

                    {/* Active Timer Countdown */}
                    <TableCell>
                      {bid.status === 'LCB_Notified' && bid.lcbNoticeSentDate ? (
                        <SlaTimerBadge
                          projectId={activeProject.id}
                          supplierId={bid.supplierId}
                          startDate={bid.lcbNoticeSentDate}
                          slaDays={5}
                          timerType="Bidder"
                          statusLabel="LCB_Notified"
                        />
                      ) : bid.status === 'Under_PostQual' && bid.postQualDocsReceivedDate ? (
                        <SlaTimerBadge
                          projectId={activeProject.id}
                          supplierId={bid.supplierId}
                          startDate={bid.postQualDocsReceivedDate}
                          slaDays={
                            activeProject.governingLaw === 'RA_9184'
                              ? RA_9184_BAC_DAYS
                              : RA_12009_BAC_DAYS
                          }
                          timerType="BAC"
                          statusLabel="Under_PostQual"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">—</span>
                      )}
                    </TableCell>

                    {/* Stateful buttons and indicators */}
                    <TableCell className="text-right">
                      {isDisqualified && (
                        <span className="text-xs font-semibold text-destructive/80 uppercase">Disqualified</span>
                      )}

                      {isWinner && (
                        <span className="text-xs font-semibold text-success uppercase">Calculated Winner (LCRB)</span>
                      )}

                      {isRowLocked && (
                        <span className="text-xs text-muted-foreground italic font-medium">Evaluation locked</span>
                      )}

                      {isActive && (
                        <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in-95">
                          
                          {/* Send Notice button */}
                          {bid.status === 'Ranked' && (
                            <Button
                              size="sm"
                              className="font-semibold shadow-sm bg-primary text-white hover:bg-primary/90"
                              onClick={() => sendNoticeOfLcb(activeProject.id, bid.supplierId)}
                            >
                              Send Notice of LCB
                            </Button>
                          )}

                          {/* Log docs received button */}
                          {bid.status === 'LCB_Notified' && (
                            <Button
                              size="sm"
                              className="font-semibold shadow-sm bg-warning text-warning-foreground hover:bg-warning/90"
                              onClick={() => logDocsReceived(activeProject.id, bid.supplierId)}
                            >
                              Log Docs Received
                            </Button>
                          )}

                          {/* Post-qual Passed / Failed Select */}
                          {bid.status === 'Under_PostQual' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Post-Qual Decision:</span>
                              <Select
                                onValueChange={(val) =>
                                  setPostQualResult(activeProject.id, bid.supplierId, val === 'passed')
                                }
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs bg-white text-default-900 border-default-300">
                                  <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="passed">Passed</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Recommend Award button */}
                          {bid.status === 'LCRB' && (
                            <Button
                              size="sm"
                              className="font-bold shadow-md bg-success hover:bg-success/90 text-white animate-pulse"
                              onClick={handleRecommend}
                            >
                              Recommend Award
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 7. PROCESS WORKFLOW GUIDE */}
      <Card className="border border-default-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-default-100 bg-default-50/50 py-3">
          <CardTitle className="text-xs font-bold text-default-900 uppercase tracking-wider">Public Bidding State Workflow Guide</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 text-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <TooltipProvider>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Ranked */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2.5 py-1 bg-default-100 rounded text-default-800 font-semibold border text-[11px] cursor-help hover:bg-default-200 transition-colors shadow-sm">
                      Ranked
                    </span>
                  </TooltipTrigger>
                  <TooltipContent color="secondary" className="p-3 max-w-[280px] shadow-xl border border-default-200">
                    <div className="space-y-1">
                      <p className="font-bold text-default-950">Ranked Status</p>
                      <p className="text-[11px] text-default-700 leading-normal font-normal">
                        Bidders are sorted according to the award criterion (LCRB or MEARB). The first-ranked bidder becomes the active LCB candidate, unlocking the initial notification workflow.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />

                {/* LCB Notified */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2.5 py-1 bg-warning/10 rounded text-warning-850 font-semibold border border-warning/20 text-[11px] cursor-help hover:bg-warning/20 transition-colors shadow-sm">
                      LCB Notified
                    </span>
                  </TooltipTrigger>
                  <TooltipContent color="secondary" className="p-3 max-w-[280px] shadow-xl border border-default-200">
                    <div className="space-y-1">
                      <p className="font-bold text-default-950">LCB Notified Status</p>
                      <p className="text-[11px] text-default-700 leading-normal font-normal">
                        The active bidder has been notified of their LCB status. A 5-day SLA countdown timer is started for the bidder to submit their original document checklist.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />

                {/* Docs Received */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2.5 py-1 bg-info/10 rounded text-info-850 font-semibold border border-info/20 text-[11px] cursor-help hover:bg-info/20 transition-colors shadow-sm">
                      Docs Received
                    </span>
                  </TooltipTrigger>
                  <TooltipContent color="secondary" className="p-3 max-w-[280px] shadow-xl border border-default-200">
                    <div className="space-y-1">
                      <p className="font-bold text-default-950">Documents Received Status</p>
                      <p className="text-[11px] text-default-700 leading-normal font-normal">
                        Original documents have been logged. The bidder's SLA timer is stopped, and the BAC Legal Evaluation SLA timer (12 days for RA 9184, 10 days for RA 12009) is initiated for TWG review.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <ChevronRight className="h-3 w-3 text-muted-foreground" />

                {/* LCRB */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="px-2.5 py-1 bg-success/10 rounded text-success-850 font-semibold border border-success/20 text-[11px] cursor-help hover:bg-success/20 transition-colors shadow-sm">
                      LCRB
                    </span>
                  </TooltipTrigger>
                  <TooltipContent color="secondary" className="p-3 max-w-[280px] shadow-xl border border-default-200">
                    <div className="space-y-1">
                      <p className="font-bold text-default-950">LCRB Status (Passed)</p>
                      <p className="text-[11px] text-default-700 leading-normal font-normal">
                        The bidder has passed all post-qualification requirements and is declared the Lowest Calculated Responsive Bid. Recommending for award generates the official BAC Resolution.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            <div className="text-muted-foreground text-left max-w-lg leading-relaxed text-[11px]">
              <p>
                <strong>Cascading Rule:</strong> Actions are strictly locked. Lower ranks can only be evaluated if the supplier above them is explicitly marked as <strong>Disqualified</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BacResolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        draft={activeProject.bacResolutionDraft}
      />
    </div>
  );
}
