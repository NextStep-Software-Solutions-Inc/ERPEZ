import { createQueryHookFromTemplate } from "erpez-shared-lib"
import { getDeliveryUnitRequest } from "@/components/features/planning/delivery-unit/handlers/getDeliveryUnitRequest"


const useDeliveryUnit = createQueryHookFromTemplate(getDeliveryUnitRequest)
function SubKpiAssignmentDetailsPage({ deliveryUnitId }: { deliveryUnitId: string }) {
    const { data: deliveryUnit } = useDeliveryUnit({
        pathParams: {
            id: deliveryUnitId
        },
        queryParams: {},
    }) 
    return (
        <div>SubKpiAssignmentDetailsPage {JSON.stringify(deliveryUnit?.data.subDeliveryUnits)} </div>
    )
}

export default SubKpiAssignmentDetailsPage