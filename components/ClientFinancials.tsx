"use client";

import { useState } from "react";
import ServicesTable, { Service } from "./ServicesTable";
import BillingTable from "./BillingTable";
import { ClientInfo } from "./ReceiptPreview";

export default function ClientFinancials({ initialServices = [], clientInfo }: { initialServices: Service[]; clientInfo: ClientInfo }) {
  const [services, setServices] = useState<Service[]>(initialServices);

  return (
    <>
      <ServicesTable services={services} setServices={setServices} />
      <BillingTable clientServices={services} clientInfo={clientInfo} />
    </>
  );
}
