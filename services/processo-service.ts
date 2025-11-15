import { apiRequest } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

export interface Processo {
    id?: number;
    empresa: string;
    nomeempresa: string;
    filial: string;
    nomefilial: string;
    pedido: string;
    item: string;
    produto: string;
    descprod: string;
    quantidade: number;
    lote: string;
    cultura: string;
    cliente: string;
    cnpjcpf: string;
    chavenfe: string;
    loja: string;
    razao: string;
    estado: string;
    municipio: string;
    fazenda: string;
    inscricao: string;
    cep: string;
    ncm: string;
    nota: string;
    serie: string;
    obsitem: string;
    geolocal: string;
    descarte: string;
    endcomple: string;
    emailAgronomo: string;
    mailagro: string;
    emaildepo: string;
    codUnidadeMedida: string;
    qntEmbalagem: number;
    areaQntTratada: number;
    cpfAgronomo?: string;
    nrArt?: string;
    nrReceita?: string;
    codCultura?: string;
    codPraga?: string;
    codTipoAplicacao?: string;
    observacao?: string;
    motivo?: string;
    detailsjson?: string;
}

export type ProcessoPayload = Omit<Processo, 'id'>;

const BASE_PATH = 'api/Process';

const withAuthHeaders = () => {
    const token = authStorage.getToken();

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`
    };
};

const defaultUpdatePayload = {
    id: 0,
    hashId: '',
    projectId: 0,
    startedIn: '',
    startedInTime: '',
    finishedAt: '',
    schedulingExecType: '',
    schedulingExecTypeId: 0,
    status: 0,
    menssageResponse: '',
    filial: '',
    pedido: '',
    produto: '',
    descprod: '',
    quantidade: 0,
    lote: '',
    cultura: '',
    cliente: '',
    estado: '',
    municipio: '',
    fazenda: '',
    inscricao: '',
    cep: '',
    item: '',
    cpfAgronomo: '',
    nrArt: '',
    nrReceita: '',
    codCultura: '',
    codPraga: '',
    codTipoAplicacao: '',
    observacao: '',
    motivo: '',
    codUnidadeMedida: '',
    areaQntTratada: '',
    qntEmbalagem: '',
    detailsjson: ''
};

const mapUpdatePayload = (id: number, payload: ProcessoPayload) => {
    return {
        ...defaultUpdatePayload,
        id,
        filial: payload.filial,
        pedido: payload.pedido,
        produto: payload.produto,
        descprod: payload.descprod,
        quantidade: payload.quantidade,
        lote: payload.lote,
        cultura: payload.cultura,
        cliente: payload.cliente,
        estado: payload.estado,
        municipio: payload.municipio,
        fazenda: payload.fazenda,
        inscricao: payload.inscricao,
        cep: payload.cep,
        item: payload.item,
        codUnidadeMedida: payload.codUnidadeMedida,
        areaQntTratada: payload.areaQntTratada?.toString() ?? '',
        qntEmbalagem: payload.qntEmbalagem?.toString() ?? '',
        cpfAgronomo: payload.cpfAgronomo ?? '',
        nrArt: payload.nrArt ?? '',
        nrReceita: payload.nrReceita ?? '',
        codCultura: payload.codCultura ?? '',
        codPraga: payload.codPraga ?? '',
        codTipoAplicacao: payload.codTipoAplicacao ?? '',
        observacao: payload.observacao ?? payload.obsitem ?? '',
        motivo: payload.motivo ?? '',
        detailsjson: payload.detailsjson ?? ''
    };
};

export const ProcessoService = {
    list: () =>
        apiRequest<Processo[]>({
            path: `${BASE_PATH}/list`,
            headers: { ...withAuthHeaders() }
        }),
    create: (payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: `${BASE_PATH}/create`,
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json', ...withAuthHeaders() }
        }),
    update: (id: number, payload: ProcessoPayload) =>
        apiRequest<Processo>({
            path: `${BASE_PATH}/update`,
            method: 'POST',
            body: JSON.stringify(mapUpdatePayload(id, payload)),
            headers: { 'Content-Type': 'application/json', ...withAuthHeaders() }
        }),
    remove: (id: number) =>
        apiRequest<void>({
            path: `${BASE_PATH}/delete`,
            method: 'PUT',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json', ...withAuthHeaders() }
        })
};
