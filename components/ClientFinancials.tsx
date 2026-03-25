"use client";

import { useState } from "react";
import ServicesTable, { Service } from "./ServicesTable";
import BillingTable from "./BillingTable";
import { ClientInfo } from "./ReceiptPreview";

export default function ClientFinancials({ initialServices = [], initialBills = [], clientInfo, clientId }: { initialServices: Service[]; initialBills: any[]; clientInfo: ClientInfo; clientId: string }) {
  const [services, setServices] = useState<Service[]>(initialServices);

  return (
    <>
      <ServicesTable services={services} setServices={setServices} />
      <BillingTable clientId={clientId} clientServices={services} clientInfo={clientInfo} bills={initialBills} />
    </>
  );
}
