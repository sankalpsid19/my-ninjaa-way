"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const email = formData.email.trim().toLowerCase();
    const name = formData.name.trim();
    const password = formData.password;

    if (!email || !password || !name) {
      return { success: false, error: "All fields are required." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdminEmail = email === process.env.ADMIN_EMAIL?.toLowerCase() || email === "sankalpyadav96@gmail.com";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isAdminEmail ? "admin" : "user",
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to register account." };
  }
}

export async function requestModuleAccess(moduleSlug: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "You must be logged in to request access." };
    }

    const userId = (session.user as any).id;
    const targetModule = await prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!targetModule) {
      return { success: false, error: "Module not found." };
    }

    const request = await prisma.accessRequest.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId: targetModule.id,
        },
      },
      update: {
        status: "pending",
      },
      create: {
        userId,
        moduleId: targetModule.id,
        status: "pending",
      },
    });

    revalidatePath("/");
    revalidatePath("/clients");
    return { success: true, request };
  } catch (error) {
    console.error("Request access error:", error);
    return { success: false, error: "Failed to submit access request." };
  }
}

export async function updateAccessRequest(requestId: string, status: "approved" | "rejected") {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const updated = await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        user: true,
        module: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/clients");
    return { success: true, request: updated };
  } catch (error) {
    console.error("Update access request error:", error);
    return { success: false, error: "Failed to update request status." };
  }
}

export async function getAccessRequests() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return [];
    }

    const requests = await prisma.accessRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        module: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return [];
  }
}

export async function getUserModuleStatuses() {
  try {
    const session = await auth();
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (!session || !session.user) {
      return modules.map((m) => ({
        ...m,
        accessStatus: "unauthenticated" as const,
      }));
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    if (userRole === "admin") {
      return modules.map((m) => ({
        ...m,
        accessStatus: "approved" as const,
      }));
    }

    const userRequests = await prisma.accessRequest.findMany({
      where: { userId },
    });

    const requestMap = new Map(userRequests.map((r) => [r.moduleId, r.status]));

    return modules.map((m) => {
      const status = requestMap.get(m.id);
      return {
        ...m,
        accessStatus: status
          ? (status as "pending" | "approved" | "rejected")
          : ("not_requested" as const),
      };
    });
  } catch (error) {
    console.error("Error getting module statuses:", error);
    return [];
  }
}

export async function checkUserModuleAccess(moduleSlug: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { authorized: false, reason: "unauthenticated" };
    }

    const role = (session.user as any).role;
    if (role === "admin") {
      return { authorized: true, role: "admin" };
    }

    const userId = (session.user as any).id;
    const targetModule = await prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!targetModule) {
      return { authorized: false, reason: "not_found" };
    }

    const request = await prisma.accessRequest.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId: targetModule.id,
        },
      },
    });

    if (request?.status === "approved") {
      return { authorized: true, role: "user" };
    }

    return { authorized: false, reason: request?.status || "not_requested" };
  } catch (error) {
    console.error("Check user module access error:", error);
    return { authorized: false, reason: "error" };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!currentPassword || !newPassword) {
      return { success: false, error: "Both current and new passwords are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password." };
  }
}

