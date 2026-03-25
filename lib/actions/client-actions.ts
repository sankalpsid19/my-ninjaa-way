"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function getClientById(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        services: {
          orderBy: { startDate: "desc" },
        },
        bills: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return client;
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    return null;
  }
}

export async function updateClientStatus(id: string, status: string) {
  try {
    const updatedClient = await prisma.client.update({
      where: { id },
      data: { status },
    });
    
    revalidatePath(`/clients/${id}`);
    revalidatePath("/clients");
    
    return { success: true, client: updatedClient };
  } catch (error) {
    console.error(`Error updating status for client ${id}:`, error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function recordPayment(clientId: string, amount: number, month: string) {
  try {
    // Check if there's already a pending bill for this month
    const existingBill = await prisma.bill.findFirst({
      where: {
        clientId,
        month,
        status: "Pending",
      },
    });

    let bill;
    const datePaid = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    if (existingBill) {
      bill = await prisma.bill.update({
        where: { id: existingBill.id },
        data: {
          status: "Paid",
          datePaid,
          amount, // Update amount in case services changed
        },
      });
    } else {
      bill = await prisma.bill.create({
        data: {
          clientId,
          amount,
          month,
          status: "Paid",
          datePaid,
        },
      });
    }

    revalidatePath(`/clients/${clientId}`);
    return { success: true, bill };
  } catch (error) {
    console.error(`Error recording payment for client ${clientId}:`, error);
    return { success: false, error: "Failed to record payment" };
  }
}
