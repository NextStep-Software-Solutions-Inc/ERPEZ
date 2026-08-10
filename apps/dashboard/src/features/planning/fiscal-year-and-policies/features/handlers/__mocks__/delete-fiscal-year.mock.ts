export const mockDeleteFiscalYear = (id: string): { success: boolean; id: string } => {
  if (!id) {
    throw new Error('Fiscal year ID is required');
  }

  return { success: true, id };
};
