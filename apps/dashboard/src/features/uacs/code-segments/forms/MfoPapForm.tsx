import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { MfoPapType } from '../types/commonTypes';
import type { MfoPap } from '../types/mfoPapTypes';

const createMfoPapSchema = (isAddingChild: boolean) => {
  return z.object({
    parentId: isAddingChild 
      ? z.string().min(1, 'Parent is required when adding a child')
      : z.string(),
    code: z.string().length(9, 'Code must be 9 digits'),
    name: z.string().min(2, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    isActive: z.boolean(),
  });
};

export type MfoPapFormValues = z.infer<ReturnType<typeof createMfoPapSchema>>;

interface MfoPapFormProps {
  onSubmit: (data: MfoPapFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  parentItem?: MfoPap;
  allItems?: MfoPap[];
}

export function MfoPapForm({ onSubmit, onCancel, isLoading, parentItem, allItems = [] }: MfoPapFormProps) {
  const isAddingChild = !!parentItem;
  
  // Get child type for a given parent
  const getChildTypeForParent = (parent: MfoPap | undefined): string => {
    if (!parent) {
      // Top-level only allows Program
      return MfoPapType.PROGRAM;
    }
    
    // Hierarchy rules: Program → Activity → Project
    if (parent.type === MfoPapType.PROGRAM) {
      return MfoPapType.ACTIVITY;
    } else if (parent.type === MfoPapType.ACTIVITY) {
      return MfoPapType.PROJECT;
    }
    
    // Projects cannot have children
    return '';
  };
  
  // Determine allowed child type based on parent type
  const getChildTypeOptions = () => {
    if (!parentItem) {
      // Top-level only allows Program
      return [{ value: MfoPapType.PROGRAM, label: 'Program' }];
    }
    
    // Hierarchy rules: Program → Activity → Project
    if (parentItem.type === MfoPapType.PROGRAM) {
      return [{ value: MfoPapType.ACTIVITY, label: 'Activity' }];
    } else if (parentItem.type === MfoPapType.ACTIVITY) {
      return [{ value: MfoPapType.PROJECT, label: 'Project' }];
    }
    
    // Projects cannot have children
    return [];
  };
  
  // Generate next code based on parent code and type
  const generateNextCode = (parent: MfoPap): string => {
    const parentCode = parent.code;
    
    // For Activity under Program (e.g., 100000001 → 100100001, 100200001)
    if (parent.type === MfoPapType.PROGRAM) {
      const prefix = parentCode.substring(0, 5); // e.g., "10000"
      // Find existing activities under this program
      const siblings = allItems.filter(item => 
        item.parentId === parent.id && item.type === MfoPapType.ACTIVITY
      );
      // Get the activity sequence number (position 5-6, starting from 01)
      const nextActivityNum = (siblings.length + 1).toString().padStart(2, '0');
      return prefix + nextActivityNum + '0001';
    }
    
    // For Project under Activity (e.g., 100100001 → 100101001, 100101002, 100101003, 100101004)
    if (parent.type === MfoPapType.ACTIVITY) {
      // Activity format: XXYY0001 → Project format: XXYY01PPP (where PPP is component sequence)
      const basePrefix = parentCode.substring(0, 5); // e.g., "10010"
      const projectPrefix = basePrefix + "1"; // e.g., "100101"
      // Find existing projects under this activity
      const siblings = allItems.filter(item => 
        item.parentId === parent.id && item.type === MfoPapType.PROJECT
      );
      // Get the component sequence number (last 3 digits, starting from 001)
      const nextComponentNum = (siblings.length + 1).toString().padStart(3, '0');
      return projectPrefix + nextComponentNum;
    }
    
    // For top-level Program (e.g., 100000001, 200000001)
    if (!parent) {
      const siblings = allItems.filter(item => item.type === MfoPapType.PROGRAM);
      const categoryNum = (Math.floor(siblings.length / 10) + 1).toString().padStart(2, '0');
      const itemNum = ((siblings.length % 10) + 1).toString().padStart(3, '0');
      return categoryNum + itemNum + '00001';
    }
    
    return '';
  };
  
  // Use allItems to generate parent suggestions, filtering for valid parents
  const parentSuggestions = allItems.filter(item => 
    item.type === MfoPapType.PROGRAM || item.type === MfoPapType.ACTIVITY
  );
  const [parentInput, setParentInput] = useState(parentItem ? parentItem.name : '');
  const [showParentSuggestions, setShowParentSuggestions] = useState(false);

  const mfoPapSchema = createMfoPapSchema(isAddingChild);
  
  // Generate next code if adding child
  const nextCode = isAddingChild && parentItem ? generateNextCode(parentItem) : '';

  const form = useForm<MfoPapFormValues>({
    resolver: zodResolver(mfoPapSchema),
    defaultValues: { 
      code: nextCode,
      name: '', 
      type: getChildTypeOptions().length > 0 ? getChildTypeOptions()[0].value : '', 
      parentId: parentItem?.id || '', 
      isActive: true 
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Parent ID with suggestions */}
        <FormField
          control={form.control}
          name={"parentId"}
          render={({ field }) => (
            <div className="relative">
              <label className="block text-sm font-medium">
                Parent {isAddingChild && <span className="text-red-500">*</span>}
                {!isAddingChild && <span className="text-gray-500">(optional)</span>}
              </label>
              <Input
                {...field}
                value={parentInput !== undefined ? parentInput : field.value}
                onChange={e => {
                  if (!isAddingChild) {
                    field.onChange(e.target.value);
                    setParentInput(e.target.value);
                    setShowParentSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (!isAddingChild) {
                    setShowParentSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowParentSuggestions(false), 150)}
                placeholder={isAddingChild ? "Auto-filled - not changeable" : "Search by parent name"}
                autoComplete="off"
                disabled={isAddingChild}
              />
              {!isAddingChild && showParentSuggestions && parentInput && (
                <div className="absolute z-50 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                  {parentSuggestions
                    .filter(s =>
                      s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                      s.id.toLowerCase().includes(parentInput.toLowerCase())
                    )
                    .map(s => (
                      <div
                        key={s.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => {
                          // Set parent ID
                          field.onChange(s.id);
                          setParentInput(s.name);
                          setShowParentSuggestions(false);
                          
                          // Auto-fill code and type based on selected parent
                          const nextCode = generateNextCode(s);
                          const childType = getChildTypeForParent(s);
                          
                          // Update form fields
                          form.setValue('code', nextCode);
                          form.setValue('type', childType);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="ml-2 text-xs text-gray-400">{s.id}</span>
                      </div>
                    ))}
                  {parentSuggestions.filter(s =>
                    s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                    s.id.toLowerCase().includes(parentInput.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-sm">No matches</div>
                  )}
                </div>
              )}
            </div>
          )}
        />
        {/* Code */}
        <FormField
          control={form.control}
          name={"code"}
          render={({ field }) => {
            const parentIdValue = form.getValues('parentId');
            const isParentSelected = !!parentIdValue && !isAddingChild;
            
            return (
              <div>
                <label className="block text-sm font-medium">
                  Code {isParentSelected && <span className="text-gray-500 text-xs">(auto-generated)</span>}
                </label>
                <Input {...field} maxLength={9} disabled={isParentSelected} />
              </div>
            );
          }}
        />
        {/* Name */}
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input {...field} />
            </div>
          )}
        />
        {/* Type as dropdown */}
        <FormField
          control={form.control}
          name={"type"}
          render={({ field }) => {
            const parentIdValue = form.getValues('parentId');
            const isParentSelected = !!parentIdValue && !isAddingChild;
            
            // Calculate type options for current parent
            let currentTypeOptions: Array<{ value: string; label: string }> = [];
            if (isAddingChild) {
              currentTypeOptions = getChildTypeOptions();
            } else if (isParentSelected) {
              const selectedParent = allItems.find(item => item.id === parentIdValue);
              if (selectedParent) {
                const childType = getChildTypeForParent(selectedParent);
                currentTypeOptions = [{ value: childType, label: childType }];
              }
            } else {
              // Default: top-level allows Program
              currentTypeOptions = [{ value: MfoPapType.PROGRAM, label: 'Program' }];
            }
            
            return (
              <div>
                <label className="block text-sm font-medium">
                  Type {(isAddingChild || isParentSelected) && <span className="text-gray-500 text-xs">(auto-determined)</span>}
                </label>
                {currentTypeOptions.length > 0 ? (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isAddingChild || isParentSelected}>
                    <SelectTrigger disabled={isAddingChild || isParentSelected}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Projects cannot have children. Please select a Program or Activity as parent.
                  </div>
                )}
              </div>
            );
          }}
        />
        {/* isActive as switch */}
        <FormField
          control={form.control}
          name={"isActive"}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <label className="text-sm">Active</label>
            </div>
          )}
        />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            disabled={isLoading || (isAddingChild && getChildTypeOptions().length === 0)}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
