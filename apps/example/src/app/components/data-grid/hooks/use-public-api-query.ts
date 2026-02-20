import { useQuery } from '@tanstack/react-query';

const DUMMYJSON_BASE = 'https://dummyjson.com';

export interface PublicApiQuery {
    skip?: number;
    take?: number;
    order?: Record<string, 'asc' | 'desc'>;
    search?: string;
}

interface DummyJsonUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: string;
    company?: { name: string; title: string };
    domain?: string;
}

export interface PublicApiUserRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    gender: string;
    companyName: string;
    companyTitle: string;
    domain: string;
}

function mapUser(u: DummyJsonUser): PublicApiUserRow {
    return {
        id: String(u.id),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        age: u.age,
        gender: u.gender,
        companyName: u.company?.name ?? '',
        companyTitle: u.company?.title ?? '',
        domain: u.domain ?? '',
    };
}

async function fetchPublicApiUsers(query: PublicApiQuery): Promise<{ items: PublicApiUserRow[]; total: number }> {
    const skip = query.skip ?? 0;
    const limit = query.take ?? 10;
    const search = (query.search ?? '').trim();
    const order = query.order ? Object.entries(query.order)[0] : null;
    const sortBy = order?.[0] ?? 'id';
    const orderDir = order?.[1] ?? 'asc';

    let url: string;
    if (search) {
        url = `${DUMMYJSON_BASE}/users/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`;
    } else {
        url = `${DUMMYJSON_BASE}/users?limit=${limit}&skip=${skip}`;
    }
    const sortByParam = sortBy === 'companyName' ? 'company.name' : sortBy === 'companyTitle' ? 'company.title' : sortBy;
    url += `&sortBy=${encodeURIComponent(sortByParam)}&order=${orderDir}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const items = (json.users ?? []).map(mapUser);
    const total = json.total ?? 0;
    return { items, total };
}

const QUERY_KEY = ['public-api-users'] as const;

export function useGetManyPublicApi(queryObj: PublicApiQuery | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [QUERY_KEY, queryObj],
        queryFn: () => fetchPublicApiUsers(queryObj!),
        enabled: options?.enabled !== false && !!queryObj,
    });
}

export async function fetchManyPublicApi(query: PublicApiQuery): Promise<{ items: PublicApiUserRow[]; total: number }> {
    return fetchPublicApiUsers(query);
}
