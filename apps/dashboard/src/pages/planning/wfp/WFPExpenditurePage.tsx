import { Banknote, Plus } from 'lucide-react';
import { createQueryHookFromTemplate } from 'erpez-shared-lib';
import { useSetAtom } from 'jotai';
import { PageContainer } from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrencyPHP, toSentenceCase, toTitleCase } from '@/utils/formatters';
import { getWFPObjectiveTargetRequest } from '@/components/features/planning/wfp/wfp-objective-target/handlers/getWFPObjectiveTargetRequest';
import { getWFPObjectiveTargetExpendituresRequest } from '@/components/features/planning/wfp/wfp-expenditure/handlers/getWFPObjectiveTargetExpendituresRequest';
import { createDialogAtom } from '@/components/features/planning/wfp/wfp-expenditure/atoms';
import CreateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/CreateWFPObjectiveTargetExpenditureDialog';
import { Actions } from '@/components/features/planning/wfp/wfp-expenditure/table/Actions';
import UpdateWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/UpdateWFPObjectiveTargetExpenditureDialog';
import DeleteWFPObjectiveTargetExpenditureDialog from '@/components/features/planning/wfp/wfp-expenditure/dialog/DeleteWFPObjectiveTargetExpenditureDialog';

const useWFPObjectiveTarget = createQueryHookFromTemplate(getWFPObjectiveTargetRequest);
const useWFPObjectiveTargetExpenditures = createQueryHookFromTemplate(getWFPObjectiveTargetExpendituresRequest);

export default function WFPExpenditurePage({ wfpObjectiveActivityId }: { wfpObjectiveActivityId: string }) {

  const { data: targetData, isLoading: isLoadingTarget } = useWFPObjectiveTarget({
    pathParams: { id: wfpObjectiveActivityId },
    queryParams: {},
  });

  const { data: expendituresResponse, isLoading: isLoadingExpenditures } = useWFPObjectiveTargetExpenditures({
    pathParams: {},
    queryParams: {
      filters: `wfpObjectiveActivityId==${wfpObjectiveActivityId}`
    }
  });

  const setCreateDialog = useSetAtom(createDialogAtom);

  if (isLoadingTarget || !targetData?.data || isLoadingExpenditures) {
    return <div className="p-8 text-center">Loading Expenditure Details...</div>;
  }

  const expenditures = expendituresResponse?.data || [];
  type ExpenditureItem = (typeof expenditures)[number];
  type GroupedData = Record<string, Record<string, Array<ExpenditureItem>>>;

  // Group expenditures by parent and object name
  const groupedExpenditures = expenditures.reduce<GroupedData>((acc: GroupedData, item: ExpenditureItem) => {
    const parentName = item.object?.parent?.name || 'Uncategorized';
    const objectName = item.object?.name || 'Unknown';

    if (!acc[parentName]) {
      acc[parentName] = {};
    }
    if (!acc[parentName][objectName]) {
      acc[parentName][objectName] = [];
    }
    acc[parentName][objectName].push(item);
    return acc;
  }, {});
  const calculateGrandTotal = () => {
    return expenditures.reduce((total: number, category: ExpenditureItem) => {
      return total + (category.unitCost * category.quantity || 0);
    }, 0);
  };
  return (
    <PageContainer
      title={toTitleCase(targetData.data.activityName) || 'Activity Expenditures'}
      description='List of Expenditure for this Activity'
      backTo={{
        to: '/v2/wfp-objective/$wfpObjectiveId',
        params: { wfpObjectiveId: targetData.data.wfpObjectiveId || targetData.data.wfpObjective?.id },
      }}
      backLabel="Back to Activity Registry"
    >
      <div className="space-y-4 mx-auto">
        {/* Expenditure List Header */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Expenditure</h2>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 flex gap-2" 
            onClick={() => setCreateDialog({ isOpen: true, showUnsavedWarning: false })}
          >
            <Plus className="h-4 w-4" /> Create Expenditure
          </Button>
        </div>

        {/* Grouped Expenditure List */}
        <div className="space-y-8">
          {(Object.entries(groupedExpenditures) as Array<[string, Record<string, Array<ExpenditureItem>>]>).map(([parentName, objects]) => (
            <div key={parentName} className="space-y-6">
              {/* Parent Category Title (Red Accent) */}
              <h3 className="text-red-600 font-black text-base uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {parentName}
              </h3>

              {(Object.entries(objects) as Array<[string, Array<ExpenditureItem>]>).map(([objectName, items]) => (
                <div key={objectName} className="relative pl-3 space-y-3">
                  {/* Red Side Accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-full" />

                  <Card className="shadow-none border-red-100 bg-white">
                    <CardHeader className="pb-2">
                      <h4 className="text-lg font-bold text-gray-900">{objectName}</h4>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-gray-100">
                        {items.map((item: ExpenditureItem, itemIdx: number) => (
                          <div key={itemIdx} className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="text-md text-gray-800 leading-snug">
                                {toSentenceCase(item.itemDescription)}
                              </h4>
                              <Actions data={item as any} actions={['read', 'write', 'delete']} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Unit Cost</p>
                                <p className="text-sm font-bold text-gray-700">{formatCurrencyPHP(item.unitCost)}</p>
                              </div>
                              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Quantity</p>
                                <p className="text-sm font-bold text-gray-700">{item.quantity}</p>
                              </div>
                              <div className="bg-red-50/50 p-2 rounded border border-red-100 text-center">
                                <p className="text-[10px] text-red-400 font-bold uppercase">Sub-Total</p>
                                <p className="text-sm font-bold text-red-600">{formatCurrencyPHP(item.unitCost * item.quantity)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ))}

          {expenditures.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 font-medium">No expenditures found for this activity.</p>
            </div>
          )}

          {/* Total Bar - Only show when there are expenditures */}
          {expenditures.length > 0 && (
            <div className="bg-red-600 rounded-xl p-4 flex justify-between items-center shadow-xl ring-4 ring-red-600/10 w-full max-w-none">
              <div className="flex items-center gap-2 text-white font-black text-xl tracking-tighter">
                <Banknote className="h-6 w-6" />
                TOTAL
              </div>
              <span className="text-white text-2xl font-black tabular-nums">
                {formatCurrencyPHP(calculateGrandTotal())}
              </span>
            </div>
          )}
        </div>
      </div>

      <CreateWFPObjectiveTargetExpenditureDialog wfpObjectiveId={wfpObjectiveActivityId} />
      <DeleteWFPObjectiveTargetExpenditureDialog />
      <UpdateWFPObjectiveTargetExpenditureDialog />
    </PageContainer>
  );
}