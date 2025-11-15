import { apiRequest } from '@/lib/api-client';

export type ProcessoStatus = 'Recebido' | 'Em andamento' | 'Concluído';
export type ProcessoPrioridade = 'Baixa' | 'Média' | 'Alta';

export interface Processo {
    id: number;
    numero: string;
    assunto: string;
    interessado: string;
    status: ProcessoStatus;
    prioridade: ProcessoPrioridade;
    atualizadoEm: string;
}

export type ProcessoPayload = Omit<Processo, 'id'>;

const RESOURCE = 'processos';

export const ProcessoService = {
    list: () => apiRequest<Processo[]>({ path: RESOURCE }),
    create: (payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: RESOURCE,
            method: 'POST',
            body: JSON.stringify(payload)
        }),
    update: (id: number, payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: `${RESOURCE}/${id}`,
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
    remove: (id: number) =>
        apiRequest<void>({
            path: `${RESOURCE}/${id}`,
            method: 'DELETE'
        })
};
