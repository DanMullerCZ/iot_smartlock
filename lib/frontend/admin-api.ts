import type {
    AccessCard,
    AccessPermission,
    AccessRequest,
    AccessResult,
    AdminUser,
    CardFormInput,
    DataResponse,
    ListResponse,
    PermissionFormInput,
    ResourceName,
    Room,
    RoomFormInput,
    UserFormInput,
} from "@/lib/frontend/admin-types";

interface ResourceMap {
    users: AdminUser;
    rooms: Room;
    "access-cards": AccessCard;
    "access-permissions": AccessPermission;
}

interface ResourceFormMap {
    users: UserFormInput;
    rooms: RoomFormInput;
    "access-cards": CardFormInput;
    "access-permissions": PermissionFormInput;
}

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

function errorToMessage(error: unknown): string {
    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object") {
        return "Please check the form fields and try again.";
    }

    return "Request failed. Please try again.";
}

async function parseJson<T>(response: Response): Promise<T> {
    return (await response.json()) as T;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(path, {
        ...init,
        headers,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = await parseJson<unknown>(response);

    if (!response.ok) {
        const error =
            payload && typeof payload === "object" && "error" in payload
                ? (payload as { error: unknown }).error
                : undefined;
        throw new ApiError(response.status, errorToMessage(error));
    }

    return payload as T;
}

function queryString(params: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : "";
}

export async function listResource<K extends ResourceName>(
    resource: K,
    params: Record<string, string | number | undefined>,
): Promise<ListResponse<ResourceMap[K]>> {
    return requestJson<ListResponse<ResourceMap[K]>>(
        `/api/admin/${resource}${queryString(params)}`,
    );
}

export async function createResource<K extends ResourceName>(
    resource: K,
    input: ResourceFormMap[K],
): Promise<ResourceMap[K]> {
    const response = await requestJson<DataResponse<ResourceMap[K]>>(`/api/admin/${resource}`, {
        method: "POST",
        body: JSON.stringify(input),
    });
    return response.data;
}

export async function updateResource<K extends ResourceName>(
    resource: K,
    id: number,
    input: Partial<ResourceFormMap[K]>,
): Promise<ResourceMap[K]> {
    const response = await requestJson<DataResponse<ResourceMap[K]>>(
        `/api/admin/${resource}/${String(id)}`,
        {
            method: "PATCH",
            body: JSON.stringify(input),
        },
    );
    return response.data;
}

export async function deleteResource(resource: ResourceName, id: number): Promise<void> {
    await requestJson<unknown>(`/api/admin/${resource}/${String(id)}`, { method: "DELETE" });
}

export async function listAccessRequests(
    params: Record<string, string | number | undefined>,
): Promise<ListResponse<AccessRequest>> {
    return requestJson<ListResponse<AccessRequest>>(
        `/api/admin/access-requests${queryString(params)}`,
    );
}

export async function listAccessResults(
    params: Record<string, string | number | undefined>,
): Promise<ListResponse<AccessResult>> {
    return requestJson<ListResponse<AccessResult>>(
        `/api/admin/access-results${queryString(params)}`,
    );
}
