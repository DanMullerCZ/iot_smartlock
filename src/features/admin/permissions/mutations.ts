import "server-only";

import { prisma } from "@/lib/db";

import { accessPermissionSelect, toAccessPermissionRow } from "./queries";
import type { AccessPermissionCreateInput, AccessPermissionPatchInput } from "./schemas";
import type { AccessPermissionRow } from "./types";

export async function createAccessPermission(
    input: AccessPermissionCreateInput,
): Promise<AccessPermissionRow> {
    const permission = await prisma.accessPermission.create({
        data: input,
        select: accessPermissionSelect,
    });

    return toAccessPermissionRow(permission);
}

export async function updateAccessPermission(
    id: number,
    input: AccessPermissionPatchInput,
): Promise<AccessPermissionRow> {
    const permission = await prisma.accessPermission.update({
        where: { id },
        data: input,
        select: accessPermissionSelect,
    });

    return toAccessPermissionRow(permission);
}

export async function softDeleteAccessPermission(id: number): Promise<void> {
    await prisma.accessPermission.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
}
