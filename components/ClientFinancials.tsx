"use client";

import { useState } from "react";
import ServicesTable, { Service } from "./ServicesTable";
import BillingTable from "./BillingTable";

export default function ClientFinancials({ initialServices = [] }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);

  return (
    <>
      <ServicesTable services={services} setServices={setServices} />
      <BillingTable clientServices={services} />
    </>
  );
}
