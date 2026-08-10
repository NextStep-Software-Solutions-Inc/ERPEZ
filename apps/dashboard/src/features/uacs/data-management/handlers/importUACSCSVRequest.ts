/**
 * Import UACS CSV Request
 * Imports UACS code segments from CSV file
 * 
 * API Endpoint: POST /uacs/import-csv (from erpez-swagger.json)
 */
export const importUACSCSVRequest = {
  endpoint: '/uacs/import-csv',
  mutationFn: async (formData: FormData) => {
    // Placeholder - will use actual API client
    // return (await api.post('/uacs/import-csv', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })).data
    return { 
      success: true, 
      imported: 0, 
      errors: [] 
    }
  },
}
