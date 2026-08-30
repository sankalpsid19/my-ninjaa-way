"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";

export async function getClients(query?: string) {
  try {
    const clients = await prisma.client.findMany({
      where: query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { company: { contains: query, mode: "insensitive" } },
        ],
      } : undefined,
      include: {
        bills: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return clients;
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    try {
      const fs = require("fs");
      const path = require("path");
      const logPath = path.join(process.cwd(), "prisma-error.log");
      fs.writeFileSync(logPath, `TIMESTAMP: ${new Date().toISOString()}\nERROR: ${error?.stack || error?.message || error}\n\n`, { flag: "a" });
    } catch (e) {
      console.error("Failed to write error log:", e);
    }
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

    // Auto-activate the website
    await prisma.client.update({
      where: { id: clientId },
      data: { status: "Active" }
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");
    return { success: true, bill };
  } catch (error) {
    console.error(`Error recording payment for client ${clientId}:`, error);
    return { success: false, error: "Failed to record payment" };
  }
}

export async function createClient(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  pocName?: string;
  pocEmail?: string;
}) {
  try {
    const joinDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    // Check if client with email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email },
    });
    
    if (existingClient) {
      return { success: false, error: "A client with this email already exists." };
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        joinDate,
        status: "Active",
      },
    });

    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client." };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    return { success: false, error: "Failed to delete client." };
  }
}

