// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

// interface DeleteFiscalYearDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   fiscalYear: FiscalYear | null;
//   onConfirm: () => void;
//   isLoading?: boolean;
// }

// /**
//  * Dialog component for confirming deletion of a fiscal year
//  */
// export function DeleteFiscalYearDialog({
//   open,
//   onOpenChange,
//   fiscalYear,
//   onConfirm,
//   isLoading = false,
// }: DeleteFiscalYearDialogProps) {
//   if (!fiscalYear) return null;

//   return (
//     <AlertDialog open={open} onOpenChange={onOpenChange}>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Delete Fiscal Year</AlertDialogTitle>
//           <AlertDialogDescription>
//             Are you sure you want to delete FY {fiscalYear.year}? This will permanently delete the fiscal year and all associated months and data. This action cannot be undone.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
//           <AlertDialogAction
//             onClick={onConfirm}
//             disabled={isLoading}
//             className="bg-destructive hover:bg-destructive/90"
//           >
//             {isLoading ? 'Deleting...' : 'Delete'}
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
