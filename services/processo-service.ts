import { apiRequest } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

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

const withAuthHeaders = () => {
    const token = authStorage.getToken();
    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

export const ProcessoService = {
    list: () =>
        apiRequest<Processo[]>({
            path: RESOURCE,
            headers: withAuthHeaders()
        }),
    create: (payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: RESOURCE,
            method: 'POST',
            body: JSON.stringify(payload),
            headers: withAuthHeaders()
        }),
    update: (id: number, payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: `${RESOURCE}/${id}`,
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: withAuthHeaders()
        }),
    remove: (id: number) =>
        apiRequest<void>({
            path: `${RESOURCE}/${id}`,
            method: 'DELETE',
            headers: withAuthHeaders()
        })
};
