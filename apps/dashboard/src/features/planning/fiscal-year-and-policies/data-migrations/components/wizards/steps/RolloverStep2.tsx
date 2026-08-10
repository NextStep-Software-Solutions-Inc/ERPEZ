'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { rolloverOptions, recurringExpensesOption } from '@/lib/fiscal-year-and-policies/rollover-mock-data';

interface RolloverStep2Props {
  formData: {
    sourceYearId: string;
    targetYearId: string;
    copyOrgStructure: boolean;
    copyOrgStructureItems?: {
      departments: boolean;
      departmentTypes?: boolean;
      departmentHierarchy?: boolean;
      costCenters: boolean;
      costCenterCodes?: boolean;
      costCenterAllocation?: boolean;
      personnelStructure: boolean;
      jobPositions?: boolean;
      personnelRoles?: boolean;
    };
    copyUACSLibrary: boolean;
    copyUACSLibraryItems?: {
      accountCodes: boolean;
      assetAccounts?: boolean;
      liabilityAccounts?: boolean;
      ledgerAccounts: boolean;
      generalLedger?: boolean;
      subledger?: boolean;
      costAllocations: boolean;
      allocationRules?: boolean;
      allocationMethods?: boolean;
    };
    copyRecurringExpenses: boolean;
  };
  setFormData: (data: any) => void;
  errors: {
    sourceYearId?: string;
    targetYearId?: string;
    copyOrgStructure?: string;
  };
}

export default function RolloverStep2({ formData, setFormData, errors }: RolloverStep2Props) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set(['orgStructure', 'uacsLibrary']));

  // Initialize hierarchical items if not present
  const orgStructureItems = formData.copyOrgStructureItems || {
    departments: formData.copyOrgStructure,
    departmentTypes: formData.copyOrgStructure,
    departmentHierarchy: formData.copyOrgStructure,
    costCenters: formData.copyOrgStructure,
    costCenterCodes: formData.copyOrgStructure,
    costCenterAllocation: formData.copyOrgStructure,
    personnelStructure: formData.copyOrgStructure,
    jobPositions: formData.copyOrgStructure,
    personnelRoles: formData.copyOrgStructure,
  };

  const uacsLibraryItems = formData.copyUACSLibraryItems || {
    accountCodes: formData.copyUACSLibrary,
    assetAccounts: formData.copyUACSLibrary,
    liabilityAccounts: formData.copyUACSLibrary,
    ledgerAccounts: formData.copyUACSLibrary,
    generalLedger: formData.copyUACSLibrary,
    subledger: formData.copyUACSLibrary,
    costAllocations: formData.copyUACSLibrary,
    allocationRules: formData.copyUACSLibrary,
    allocationMethods: formData.copyUACSLibrary,
  };

  // Toggle collapsed state for a parent item
  const toggleCollapsed = (id: string) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsedItems(newCollapsed);
  };

  // Calculate parent checkbox state based on children
  const isOrgStructureAllChecked =
    orgStructureItems.departments &&
    orgStructureItems.costCenters &&
    orgStructureItems.personnelStructure;

  const isOrgStructurePartialChecked =
    (orgStructureItems.departments ||
      orgStructureItems.costCenters ||
      orgStructureItems.personnelStructure) &&
    !isOrgStructureAllChecked;

  const isUACSLibraryAllChecked =
    uacsLibraryItems.accountCodes &&
    uacsLibraryItems.ledgerAccounts &&
    uacsLibraryItems.costAllocations;

  const isUACSLibraryPartialChecked =
    (uacsLibraryItems.accountCodes ||
      uacsLibraryItems.ledgerAccounts ||
      uacsLibraryItems.costAllocations) &&
    !isUACSLibraryAllChecked;

  // Handle parent checkbox change
  const handleOrgStructureParentChange = (checked: boolean) => {
    setFormData({
      ...formData,
      copyOrgStructure: checked,
      copyOrgStructureItems: {
        departments: checked,
        departmentTypes: checked,
        departmentHierarchy: checked,
        costCenters: checked,
        costCenterCodes: checked,
        costCenterAllocation: checked,
        personnelStructure: checked,
        jobPositions: checked,
        personnelRoles: checked,
      },
    });
  };

  const handleUACSLibraryParentChange = (checked: boolean) => {
    setFormData({
      ...formData,
      copyUACSLibrary: checked,
      copyUACSLibraryItems: {
        accountCodes: checked,
        assetAccounts: checked,
        liabilityAccounts: checked,
        ledgerAccounts: checked,
        generalLedger: checked,
        subledger: checked,
        costAllocations: checked,
        allocationRules: checked,
        allocationMethods: checked,
      },
    });
  };

  // Handle child/parent checkbox change
  const handleOrgStructureItemChange = (key: string, checked: boolean) => {
    const updatedItems = { ...orgStructureItems, [key]: checked };
    const mainKeys = ['departments', 'costCenters', 'personnelStructure'];
    const allMainChecked = mainKeys.every((k) => updatedItems[k as keyof typeof updatedItems] === true);

    setFormData({
      ...formData,
      copyOrgStructure: allMainChecked,
      copyOrgStructureItems: updatedItems,
    });
  };

  const handleUACSLibraryItemChange = (key: string, checked: boolean) => {
    const updatedItems = { ...uacsLibraryItems, [key]: checked };
    const mainKeys = ['accountCodes', 'ledgerAccounts', 'costAllocations'];
    const allMainChecked = mainKeys.every((k) => updatedItems[k as keyof typeof updatedItems] === true);

    setFormData({
      ...formData,
      copyUACSLibrary: allMainChecked,
      copyUACSLibraryItems: updatedItems,
    });
  };

  const hasSelection =
    formData.copyOrgStructure || formData.copyUACSLibrary || formData.copyRecurringExpenses;

  return (
    <div className="space-y-6 py-4">
      <div>
        <p className="text-sm text-muted-foreground mb-6">
          Select which data types to copy from the source year to the target year:
        </p>

        <div className="max-h-[38vh] overflow-y-auto pr-3 space-y-6 border rounded-lg p-4 bg-secondary/30">
          {/* Organization Structure - Hierarchical */}
          <div className="space-y-3 border-l-2 border-primary/20 pl-4">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleCollapsed('orgStructure')}
                className="p-0 hover:bg-accent rounded transition-colors mt-1"
                aria-expanded={!collapsedItems.has('orgStructure')}
              >
                {collapsedItems.has('orgStructure') ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <Checkbox
                id="copyOrgStructure"
                checked={isOrgStructureAllChecked}
                onCheckedChange={(checked) =>
                  handleOrgStructureParentChange(checked === true)
                }
              />
              <div className="space-y-1">
                <Label htmlFor="copyOrgStructure" className="font-medium cursor-pointer">
                  {rolloverOptions.orgStructure.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Copies departments, divisions, and organizational hierarchy
                </p>
              </div>
            </div>

            {/* Child items - collapsible and scrollable */}
            {!collapsedItems.has('orgStructure') && (
            <div className="ml-6 space-y-2 max-h-96 overflow-y-auto pr-2">
              {rolloverOptions.orgStructure.children.map((child) => {
                const isCollapsed = collapsedItems.has(`orgStructure-${child.id}`);
                const hasSubChildren = child.children && child.children.length > 0;

                return (
                  <div key={child.id} className="space-y-2">
                    <div className="flex items-center space-x-3">
                      {hasSubChildren && (
                        <button
                          onClick={() => toggleCollapsed(`orgStructure-${child.id}`)}
                          className="p-0 hover:bg-accent rounded transition-colors"
                          aria-expanded={!isCollapsed}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {!hasSubChildren && <div className="w-4" />}
                      <Checkbox
                        id={`orgStructure-${child.id}`}
                        checked={
                          orgStructureItems[
                            child.id as keyof typeof orgStructureItems
                          ] || false
                        }
                        onCheckedChange={(checked) =>
                          handleOrgStructureItemChange(
                            child.id,
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`orgStructure-${child.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {child.label}
                      </Label>
                    </div>

                    {/* Subchildren - shown when parent is not collapsed */}
                    {hasSubChildren && !isCollapsed && (
                      <div className="ml-8 space-y-2">
                        {child.children?.map((subChild) => (
                          <div key={subChild.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`orgStructure-${subChild.id}`}
                              checked={
                                orgStructureItems[
                                  subChild.id as keyof typeof orgStructureItems
                                ] || false
                              }
                              onCheckedChange={(checked) =>
                                handleOrgStructureItemChange(
                                  subChild.id,
                                  checked === true
                                )
                              }
                            />
                            <Label
                              htmlFor={`orgStructure-${subChild.id}`}
                              className="text-xs cursor-pointer text-muted-foreground"
                            >
                              {subChild.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* UACS Library - Hierarchical */}
          <div className="space-y-3 border-l-2 border-primary/20 pl-4">
            <div className="flex items-start space-x-3">
              <button
                onClick={() => toggleCollapsed('uacsLibrary')}
                className="p-0 hover:bg-accent rounded transition-colors mt-1"
                aria-expanded={!collapsedItems.has('uacsLibrary')}
              >
                {collapsedItems.has('uacsLibrary') ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <Checkbox
                id="copyUACSLibrary"
                checked={isUACSLibraryAllChecked || isUACSLibraryPartialChecked}
                onCheckedChange={(checked) =>
                  handleUACSLibraryParentChange(checked === true)
                }
              />
              <div className="space-y-1">
                <Label htmlFor="copyUACSLibrary" className="font-medium cursor-pointer">
                  {rolloverOptions.uacsLibrary.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Copies the Uniform Accounting Code Structure for accounts and cost centers
                </p>
              </div>
            </div>

            {/* Child items - collapsible and scrollable */}
            {!collapsedItems.has('uacsLibrary') && (
            <div className="ml-6 space-y-2 max-h-96 overflow-y-auto pr-2">
              {rolloverOptions.uacsLibrary.children.map((child) => {
                const isCollapsed = collapsedItems.has(`uacsLibrary-${child.id}`);
                const hasSubChildren = child.children && child.children.length > 0;

                return (
                  <div key={child.id} className="space-y-2">
                    <div className="flex items-center space-x-3">
                      {hasSubChildren && (
                        <button
                          onClick={() => toggleCollapsed(`uacsLibrary-${child.id}`)}
                          className="p-0 hover:bg-accent rounded transition-colors"
                          aria-expanded={!isCollapsed}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {!hasSubChildren && <div className="w-4" />}
                      <Checkbox
                        id={`uacsLibrary-${child.id}`}
                        checked={
                          uacsLibraryItems[
                            child.id as keyof typeof uacsLibraryItems
                          ] || false
                        }
                        onCheckedChange={(checked) =>
                          handleUACSLibraryItemChange(
                            child.id,
                            checked === true
                          )
                        }
                      />
                      <Label
                        htmlFor={`uacsLibrary-${child.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {child.label}
                      </Label>
                    </div>

                    {/* Subchildren - shown when parent is not collapsed */}
                    {hasSubChildren && !isCollapsed && (
                      <div className="ml-8 space-y-2">
                        {child.children?.map((subChild) => (
                          <div key={subChild.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`uacsLibrary-${subChild.id}`}
                              checked={
                                uacsLibraryItems[
                                  subChild.id as keyof typeof uacsLibraryItems
                                ] || false
                              }
                              onCheckedChange={(checked) =>
                                handleUACSLibraryItemChange(
                                  subChild.id,
                                  checked === true
                                )
                              }
                            />
                            <Label
                              htmlFor={`uacsLibrary-${subChild.id}`}
                              className="text-xs cursor-pointer text-muted-foreground"
                            >
                              {subChild.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Recurring Expenses - Flat */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="copyRecurringExpenses"
              checked={formData.copyRecurringExpenses}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  copyRecurringExpenses: checked === true,
                })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="copyRecurringExpenses" className="font-medium cursor-pointer">
                {recurringExpensesOption.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {recurringExpensesOption.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
        {!hasSelection && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              ⚠️ <strong>Please select at least one option</strong> to proceed
            </p>
          </div>
        )}

        {errors.copyOrgStructure && !hasSelection && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{errors.copyOrgStructure}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
