import { useQuery } from '@tanstack/react-query';

const FDA_BASE = 'https://api.fda.gov/drug/event.json';

export interface FdaApiQuery {
    skip?: number;
    take?: number;
    order?: Record<string, 'asc' | 'desc'>;
    search?: string;
}

interface FdaEventResult {
    safetyreportid: string;
    receivedate?: string;
    serious?: string;
    primarysource?: { reportercountry?: string };
    patient?: { patientsex?: string; reaction?: Array<{ reactionmeddrapt?: string }> };
    drug?: Array<{ medicinalproduct?: string }>;
}

export interface FdaEventRow {
    id: string;
    receivedate: string;
    serious: string;
    country: string;
    patientSex: string;
    drug: string;
    reaction: string;
}

function mapFdaEventToRow(event: FdaEventResult): FdaEventRow {
    const drug = event.drug?.[0]?.medicinalproduct ?? '';
    const reaction = event.patient?.reaction?.[0]?.reactionmeddrapt ?? '';
    return {
        id: event.safetyreportid,
        receivedate: event.receivedate ?? '',
        serious: event.serious === '1' ? 'Yes' : 'No',
        country: event.primarysource?.reportercountry ?? '',
        patientSex:
            event.patient?.patientsex === '1'
                ? 'Male'
                : event.patient?.patientsex === '2'
                  ? 'Female'
                  : '',
        drug,
        reaction,
    };
}

interface FdaResponse {
    meta?: { results?: { total: number; skip: number; limit: number } };
    results?: FdaEventResult[];
}

async function fetchFdaEvents(query: FdaApiQuery): Promise<{ items: FdaEventRow[]; total: number }> {
    const skip = query.skip ?? 0;
    const limit = Math.min(query.take ?? 10, 1000);
    const cappedSkip = Math.min(skip, 25000);
    const search = (query.search ?? '').trim();
    const order = query.order ? Object.entries(query.order)[0] : null;

    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('skip', String(cappedSkip));

    if (search) {
        params.set('search', `patient.reaction.reactionmeddrapt:"${search.replace(/"/g, '')}"`);
    }
    if (order?.[0] === 'receivedate') {
        params.set('sort', `receivedate:${order[1] === 'desc' ? 'desc' : 'asc'}`);
    }

    const url = `${FDA_BASE}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FDA API error: ${res.status}`);
    const json: FdaResponse = await res.json();
    const items = (json.results ?? []).map(mapFdaEventToRow);
    const total = json.meta?.results?.total ?? 0;
    return { items, total };
}

const QUERY_KEY = ['fda-api-events'] as const;

export function useGetManyFdaApi(queryObj: FdaApiQuery | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: [QUERY_KEY, queryObj],
        queryFn: () => fetchFdaEvents(queryObj!),
        enabled: options?.enabled !== false && !!queryObj,
    });
}

export async function fetchManyFdaApi(
    query: FdaApiQuery
): Promise<{ items: FdaEventRow[]; total: number }> {
    return fetchFdaEvents(query);
}
