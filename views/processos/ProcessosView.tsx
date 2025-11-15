'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { Processo, ProcessoPayload, ProcessoService } from '@/services/processo-service';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const fallbackProcessos: Processo[] = [
    {
        id: 1,
        empresa: '003',
        nomeempresa: 'Viseu Agro Tecnologia S/A',
        filial: '005',
        nomefilial: 'Filial Londrina',
        pedido: '990234',
        item: '003',
        produto: 'INS450',
        descprod: 'Inseticida Turbo 450 WG',
        quantidade: 600,
        lote: 'L2025-089',
        cultura: 'Trigo',
        cliente: '001245',
        cnpjcpf: '55667788000144',
        chavenfe: '41251155667788000144550030009902341000099023',
        loja: '03',
        razao: 'Fazenda Campo Verde',
        estado: 'PR',
        municipio: 'Londrina',
        fazenda: 'Fazenda Campo Verde',
        inscricao: '445566778899',
        cep: '86010000',
        ncm: '38089119',
        nota: '990234',
        serie: '3',
        obsitem: 'Aplicação em faixa, respeitar zona de amortecimento.',
        geolocal: '-23.304000,-51.169600',
        descarte: 'Realizar tríplice lavagem e devolver nas centrais de recebimento.',
        endcomple: 'Estrada da Fazenda, km 8, Zona Rural',
        emailAgronomo: 'carlos.souza@viseuagro.com.br',
        mailagro: 'carlos.souza@viseuagro.com.br',
        emaildepo: 'gerencia@fazendacampoverde.com.br',
        codUnidadeMedida: 'KG',
        qntEmbalagem: 25,
        areaQntTratada: 210
    }
];

const emptyProcesso: ProcessoPayload = {
    empresa: '',
    nomeempresa: '',
    filial: '',
    nomefilial: '',
    pedido: '',
    item: '',
    produto: '',
    descprod: '',
    quantidade: 0,
    lote: '',
    cultura: '',
    cliente: '',
    cnpjcpf: '',
    chavenfe: '',
    loja: '',
    razao: '',
    estado: '',
    municipio: '',
    fazenda: '',
    inscricao: '',
    cep: '',
    ncm: '',
    nota: '',
    serie: '',
    obsitem: '',
    geolocal: '',
    descarte: '',
    endcomple: '',
    emailAgronomo: '',
    mailagro: '',
    emaildepo: '',
    codUnidadeMedida: '',
    qntEmbalagem: 0,
    areaQntTratada: 0
};

type FieldType = 'text' | 'number' | 'textarea';

interface FormFieldConfig {
    name: keyof ProcessoPayload;
    label: string;
    type?: FieldType;
    col?: string;
}

interface FormSection {
    title: string;
    fields: FormFieldConfig[];
}

const requiredFields: (keyof ProcessoPayload)[] = ['empresa', 'filial', 'pedido', 'produto', 'quantidade'];

const formSections: FormSection[] = [
    {
        title: 'Dados do Pedido',
        fields: [
            { name: 'empresa', label: 'Empresa' },
            { name: 'nomeempresa', label: 'Nome da Empresa' },
            { name: 'filial', label: 'Filial' },
            { name: 'nomefilial', label: 'Nome da Filial' },
            { name: 'pedido', label: 'Pedido' },
            { name: 'item', label: 'Item' },
            { name: 'produto', label: 'Produto' },
            { name: 'descprod', label: 'Descrição do Produto', col: 'col-12' },
            { name: 'quantidade', label: 'Quantidade', type: 'number' },
            { name: 'codUnidadeMedida', label: 'Unidade de Medida' },
            { name: 'qntEmbalagem', label: 'Qtd. por Embalagem', type: 'number' },
            { name: 'lote', label: 'Lote' },
            { name: 'cultura', label: 'Cultura' },
            { name: 'areaQntTratada', label: 'Área/Qtd. Tratada', type: 'number' },
            { name: 'obsitem', label: 'Observações do Item', type: 'textarea', col: 'col-12' }
        ]
    },
    {
        title: 'Documento Fiscal',
        fields: [
            { name: 'nota', label: 'Nota Fiscal' },
            { name: 'serie', label: 'Série' },
            { name: 'ncm', label: 'NCM' },
            { name: 'chavenfe', label: 'Chave NF-e', col: 'col-12' }
        ]
    },
    {
        title: 'Cliente e Local de Aplicação',
        fields: [
            { name: 'cliente', label: 'Cliente' },
            { name: 'cnpjcpf', label: 'CNPJ/CPF' },
            { name: 'loja', label: 'Loja' },
            { name: 'razao', label: 'Razão Social' },
            { name: 'estado', label: 'Estado' },
            { name: 'municipio', label: 'Município' },
            { name: 'fazenda', label: 'Fazenda' },
            { name: 'inscricao', label: 'Inscrição Estadual' },
            { name: 'cep', label: 'CEP' },
            { name: 'geolocal', label: 'Geolocalização' },
            { name: 'endcomple', label: 'Endereço Completo', col: 'col-12' },
            { name: 'descarte', label: 'Descarte', type: 'textarea', col: 'col-12' }
        ]
    },
    {
        title: 'Contatos',
        fields: [
            { name: 'emailAgronomo', label: 'E-mail do Agrônomo' },
            { name: 'mailagro', label: 'E-mail Agrônomo (cópia)' },
            { name: 'emaildepo', label: 'E-mail do Depósito' }
        ]
    }
];

const ProcessosView = () => {
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteManyDialogVisible, setDeleteManyDialogVisible] = useState(false);
    const [formValues, setFormValues] = useState<ProcessoPayload>(emptyProcesso);
    const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
    const [selectedProcessos, setSelectedProcessos] = useState<Processo[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const { user, logout, isAuthenticated, initializing } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!initializing && isAuthenticated) {
            fetchProcessos();
        }
    }, [initializing, isAuthenticated]);

    useEffect(() => {
        if (!initializing && !isAuthenticated) {
            router.replace('/login');
        }
    }, [initializing, isAuthenticated, router]);

    const fetchProcessos = async () => {
        if (!isAuthenticated) {
            return;
        }

        setLoading(true);
        const { data, error } = await ProcessoService.list();
        if (error || !data) {
            toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Não foi possível carregar do backend. Dados mockados exibidos.', life: 5000 });
            setProcessos(fallbackProcessos);
        } else {
            setProcessos(data);
        }
        setLoading(false);
    };

    const openNew = () => {
        setFormValues(emptyProcesso);
        setEditingProcesso(null);
        setSubmitted(false);
        setDialogVisible(true);
    };

    const editProcesso = (processo: Processo) => {
        const { id, ...payload } = processo;
        setFormValues(payload);
        setEditingProcesso(processo);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setSubmitted(false);
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
    };

    const hideDeleteManyDialog = () => {
        setDeleteManyDialogVisible(false);
    };

    const isFieldEmpty = (value: ProcessoPayload[keyof ProcessoPayload]) => {
        if (typeof value === 'number') {
            return value <= 0;
        }

        return !value || (typeof value === 'string' && !value.trim());
    };

    const hasFieldError = (field: keyof ProcessoPayload) => requiredFields.includes(field) && isFieldEmpty(formValues[field]);

    const updateFormValue = <K extends keyof ProcessoPayload>(field: K, value: ProcessoPayload[K]) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const persistProcesso = async () => {
        setSubmitted(true);
        const invalid = requiredFields.some((field) => hasFieldError(field));
        if (invalid) {
            return;
        }

        const payload = { ...formValues };
        let response;
        if (editingProcesso?.id) {
            response = await ProcessoService.update(editingProcesso.id, payload);
        } else {
            response = await ProcessoService.create(payload);
        }

        if (response.error || !response.data) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Aviso',
                detail: 'Backend indisponível. Atualização local aplicada.',
                life: 4000
            });

            if (editingProcesso) {
                setProcessos((prev) => prev.map((item) => (item.id === editingProcesso.id ? { ...editingProcesso, ...payload } : item)));
            } else {
                const localItem: Processo = { ...payload, id: Date.now() };
                setProcessos((prev) => [...prev, localItem]);
            }
        } else {
            if (editingProcesso) {
                setProcessos((prev) => prev.map((item) => (item.id === editingProcesso.id ? response.data! : item)));
            } else {
                setProcessos((prev) => [...prev, response.data!]);
            }
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Processo ${editingProcesso ? 'atualizado' : 'criado'} com sucesso`,
            life: 3000
        });
        setDialogVisible(false);
        setEditingProcesso(null);
        setFormValues(emptyProcesso);
    };

    const confirmDeleteProcesso = (processo: Processo) => {
        setEditingProcesso(processo);
        setDeleteDialogVisible(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteManyDialogVisible(true);
    };

    const removeProcesso = async () => {
        if (!editingProcesso) return;

        if (editingProcesso.id) {
            await ProcessoService.remove(editingProcesso.id);
        }

        setProcessos((prev) => prev.filter((item) => item !== editingProcesso));
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Processo excluído.', life: 3000 });
        setDeleteDialogVisible(false);
        setEditingProcesso(null);
    };

    const removeSelectedProcessos = async () => {
        await Promise.all(
            selectedProcessos
                .filter((processo) => processo.id)
                .map((processo) => ProcessoService.remove(processo.id as number))
        );

        setProcessos((prev) => prev.filter((item) => !selectedProcessos.includes(item)));
        setSelectedProcessos([]);
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Processos removidos.', life: 3000 });
        setDeleteManyDialogVisible(false);
    };

    const renderField = (field: FormFieldConfig) => {
        const value = formValues[field.name];
        const invalid = submitted && hasFieldError(field.name);
        const colClass = field.col ?? 'col-12 md:col-6';

        const inputClass = classNames('w-full', { 'p-invalid': invalid });

        let input: React.ReactNode;

        if (field.type === 'textarea') {
            input = <InputTextarea id={field.name} value={value as string} onChange={(e) => updateFormValue(field.name, e.target.value)} rows={3} autoResize className={inputClass} />;
        } else if (field.type === 'number') {
            input = (
                <InputNumber
                    id={field.name}
                    value={value as number}
                    onValueChange={(e) => updateFormValue(field.name, e.value ?? 0)}
                    className={inputClass}
                    inputClassName="w-full"
                    useGrouping={false}
                />
            );
        } else {
            input = <InputText id={field.name} value={value as string} onChange={(e) => updateFormValue(field.name, e.target.value)} className={inputClass} />;
        }

        return (
            <div key={field.name} className={colClass}>
                <label htmlFor={field.name} className="font-medium">
                    {field.label}
                </label>
                {input}
                {invalid && <small className="p-error">Campo obrigatório</small>}
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
            <h5 className="m-0">Gerenciamento de Processos</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const leftToolbarTemplate = () => (
        <>
            <Button label="Novo" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProcessos.length} />
        </>
    );

    const rightToolbarTemplate = () => (
        <div className="flex align-items-center gap-3 flex-wrap">
            {user && (
                <span className="text-sm text-500">
                    Logado como <strong>{user.fullname ?? user.username}</strong>
                </span>
            )}
            <Button label="Atualizar" icon="pi pi-refresh" outlined onClick={fetchProcessos} />
            <Button label="Sair" icon="pi pi-sign-out" severity="secondary" onClick={handleLogout} />
        </div>
    );

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" onClick={persistProcesso} />
        </>
    );

    const deleteFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Excluir" icon="pi pi-check" severity="danger" onClick={removeProcesso} />
        </>
    );

    const deleteManyFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDeleteManyDialog} />
            <Button label="Excluir" icon="pi pi-check" severity="danger" onClick={removeSelectedProcessos} />
        </>
    );

    if (initializing) {
        return (
            <div className="flex align-items-center justify-content-center min-h-full">
                <i className="pi pi-spin pi-spinner text-4xl"></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        value={processos}
                        selection={selectedProcessos}
                        onSelectionChange={(e) => setSelectedProcessos((e.value as Processo[]) ?? [])}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 20]}
                        loading={loading}
                        header={header}
                        globalFilter={globalFilter}
                        globalFilterFields={['empresa', 'filial', 'pedido', 'produto', 'cliente', 'estado', 'municipio', 'cnpjcpf']}
                        emptyMessage="Nenhum processo encontrado."
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="empresa" header="Empresa" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="filial" header="Filial" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="pedido" header="Pedido" sortable style={{ minWidth: '8rem' }}></Column>
                        <Column field="produto" header="Produto" sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="quantidade" header="Qtd." sortable style={{ minWidth: '6rem' }}></Column>
                        <Column field="cliente" header="Cliente" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="estado" header="UF" sortable style={{ minWidth: '5rem' }}></Column>
                        <Column field="municipio" header="Município" sortable style={{ minWidth: '10rem' }}></Column>
                        <Column field="fazenda" header="Fazenda" style={{ minWidth: '12rem' }}></Column>
                        <Column body={(rowData) => actionBodyTemplate(rowData)} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={dialogVisible} style={{ width: '75vw' }} header={editingProcesso ? 'Editar Processo' : 'Novo Processo'} modal className="p-fluid" footer={dialogFooter} onHide={hideDialog}>
                        {formSections.map((section) => (
                            <div key={section.title} className="mb-4">
                                <h6 className="mt-0">{section.title}</h6>
                                <div className="grid">{section.fields.map((field) => renderField(field))}</div>
                            </div>
                        ))}
                    </Dialog>

                    <Dialog visible={deleteDialogVisible} style={{ width: '450px' }} header="Confirmar" modal footer={deleteFooter} onHide={hideDeleteDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {editingProcesso && (
                                <span>
                                    Deseja remover o processo <strong>{editingProcesso.pedido}</strong>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteManyDialogVisible} style={{ width: '450px' }} header="Confirmar" modal footer={deleteManyFooter} onHide={hideDeleteManyDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Deseja remover os processos selecionados?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );

    function actionBodyTemplate(rowData: Processo) {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => editProcesso(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProcesso(rowData)} />
            </div>
        );
    }
};

export default ProcessosView;
