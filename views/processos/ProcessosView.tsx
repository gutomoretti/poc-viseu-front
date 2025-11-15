'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { Processo, ProcessoPayload, ProcessoPrioridade, ProcessoService, ProcessoStatus } from '@/services/processo-service';
import { SelectItem } from 'primereact/selectitem';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const fallbackProcessos: Processo[] = [
    {
        id: 1,
        numero: 'PRC-2024/00001',
        assunto: 'Abertura de licitação',
        interessado: 'Departamento de Compras',
        status: 'Em andamento',
        prioridade: 'Alta',
        atualizadoEm: new Date().toISOString()
    },
    {
        id: 2,
        numero: 'PRC-2024/00002',
        assunto: 'Atualização contratual',
        interessado: 'Jurídico',
        status: 'Recebido',
        prioridade: 'Média',
        atualizadoEm: new Date().toISOString()
    }
];

const emptyProcesso: ProcessoPayload = {
    numero: '',
    assunto: '',
    interessado: '',
    status: 'Recebido',
    prioridade: 'Média',
    atualizadoEm: new Date().toISOString()
};

const statusSeverity: Record<ProcessoStatus, 'success' | 'info' | 'warning'> = {
    Recebido: 'info',
    'Em andamento': 'warning',
    Concluído: 'success'
};

const prioridadeSeverity: Record<ProcessoPrioridade, 'success' | 'warning' | 'danger'> = {
    Baixa: 'success',
    Média: 'warning',
    Alta: 'danger'
};

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

    const statusOptions = useMemo<SelectItem<ProcessoStatus>[]>(() => ['Recebido', 'Em andamento', 'Concluído'].map((status) => ({ label: status, value: status })), []);
    const prioridadeOptions = useMemo<SelectItem<ProcessoPrioridade>[]>(() => ['Baixa', 'Média', 'Alta'].map((prioridade) => ({ label: prioridade, value: prioridade })), []);

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
        if (error && data === null) {
            toast.current?.show({ severity: 'warn', summary: 'Aviso', detail: 'Não foi possível carregar do backend. Dados mockados exibidos.', life: 5000 });
            setProcessos(fallbackProcessos);
        } else if (data) {
            setProcessos(data);
        }
        setLoading(false);
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

    const openNew = () => {
        setFormValues({ ...emptyProcesso, atualizadoEm: new Date().toISOString() });
        setEditingProcesso(null);
        setSubmitted(false);
        setDialogVisible(true);
    };

    const editProcesso = (processo: Processo) => {
        setEditingProcesso(processo);
        setFormValues({
            numero: processo.numero,
            assunto: processo.assunto,
            interessado: processo.interessado,
            status: processo.status,
            prioridade: processo.prioridade,
            atualizadoEm: processo.atualizadoEm
        });
        setDialogVisible(true);
    };

    const confirmDeleteProcesso = (processo: Processo) => {
        setEditingProcesso(processo);
        setDeleteDialogVisible(true);
    };

    const confirmDeleteSelected = () => {
        setDeleteManyDialogVisible(true);
    };

    const persistProcesso = async () => {
        setSubmitted(true);

        if (!formValues.numero.trim() || !formValues.assunto.trim()) {
            return;
        }

        const payload = { ...formValues };
        let response;
        if (editingProcesso) {
            response = await ProcessoService.update(editingProcesso.id, payload);
        } else {
            response = await ProcessoService.create(payload);
        }

        if (response.error) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Backend indisponível. Usando estado local.', life: 4000 });
            if (editingProcesso) {
                setProcessos((prev) => prev.map((item) => (item.id === editingProcesso.id ? { ...editingProcesso, ...payload } : item)));
            } else {
                const newItem: Processo = { ...payload, id: Date.now() };
                setProcessos((prev) => [...prev, newItem]);
            }
        } else if (response.data) {
            if (editingProcesso) {
                setProcessos((prev) => prev.map((item) => (item.id === editingProcesso.id ? response.data! : item)));
            } else {
                setProcessos((prev) => [...prev, response.data!]);
            }
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Processo ${editingProcesso ? 'atualizado' : 'criado'} com sucesso.`,
            life: 3000
        });
        setDialogVisible(false);
        setEditingProcesso(null);
        setFormValues(emptyProcesso);
    };

    const removeProcesso = async () => {
        if (!editingProcesso) return;

        const response = await ProcessoService.remove(editingProcesso.id);
        if (response.error) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Backend indisponível. Removendo localmente.', life: 4000 });
        }

        setProcessos((prev) => prev.filter((item) => item.id !== editingProcesso.id));
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Processo removido.', life: 3000 });
        setDeleteDialogVisible(false);
        setEditingProcesso(null);
    };

    const removeSelectedProcessos = async () => {
        await Promise.all(selectedProcessos.map((processo) => ProcessoService.remove(processo.id)));
        setProcessos((prev) => prev.filter((item) => !selectedProcessos.some((selected) => selected.id === item.id)));
        setDeleteManyDialogVisible(false);
        setSelectedProcessos([]);
        toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Processos removidos.', life: 3000 });
    };

    const getFormErrorMessage = (field: keyof ProcessoPayload) => {
        if (!submitted) return null;
        if (!(formValues as any)[field]) {
            return <small className="p-error">Campo obrigatório</small>;
        }
        return null;
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
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

    const statusBodyTemplate = (rowData: Processo) => {
        return <Tag value={rowData.status} severity={statusSeverity[rowData.status]} />;
    };

    const prioridadeBodyTemplate = (rowData: Processo) => {
        return <Tag value={rowData.prioridade} severity={prioridadeSeverity[rowData.prioridade]} />;
    };

    const dateBodyTemplate = (rowData: Processo) => {
        return new Date(rowData.atualizadoEm).toLocaleDateString('pt-BR');
    };

    const actionBodyTemplate = (rowData: Processo) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => editProcesso(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProcesso(rowData)} />
            </div>
        );
    };

    const dialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" onClick={persistProcesso} />
        </React.Fragment>
    );

    const deleteFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Excluir" icon="pi pi-check" severity="danger" onClick={removeProcesso} />
        </React.Fragment>
    );

    const deleteManyFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDeleteManyDialog} />
            <Button label="Excluir" icon="pi pi-check" severity="danger" onClick={removeSelectedProcessos} />
        </React.Fragment>
    );

    const leftToolbarTemplate = () => (
        <React.Fragment>
            <Button label="Novo" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProcessos || !selectedProcessos.length} />
        </React.Fragment>
    );

    const rightToolbarTemplate = () => (
        <div className="flex align-items-center gap-2">
            {user && (
                <span className="text-sm text-500">
                    Logado como <strong>{user.username}</strong>
                </span>
            )}
            <Button label="Atualizar" icon="pi pi-refresh" outlined onClick={fetchProcessos} />
            <Button label="Sair" icon="pi pi-sign-out" severity="secondary" onClick={handleLogout} />
        </div>
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
                        emptyMessage="Nenhum processo encontrado."
                        className="datatable-responsive"
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" exportable={false}></Column>
                        <Column field="numero" header="Número" sortable style={{ minWidth: '14rem' }}></Column>
                        <Column field="assunto" header="Assunto" sortable style={{ minWidth: '16rem' }}></Column>
                        <Column field="interessado" header="Interessado" sortable style={{ minWidth: '14rem' }}></Column>
                        <Column field="status" header="Status" body={statusBodyTemplate} style={{ minWidth: '12rem' }}></Column>
                        <Column field="prioridade" header="Prioridade" body={prioridadeBodyTemplate} style={{ minWidth: '10rem' }}></Column>
                        <Column field="atualizadoEm" header="Atualizado em" body={dateBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={dialogVisible} style={{ width: '450px' }} header={editingProcesso ? 'Editar Processo' : 'Novo Processo'} modal className="p-fluid" footer={dialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="numero">Número</label>
                            <InputText id="numero" value={formValues.numero} onChange={(e) => setFormValues((prev) => ({ ...prev, numero: e.target.value }))} autoFocus className={classNames({ 'p-invalid': submitted && !formValues.numero })} />
                            {getFormErrorMessage('numero')}
                        </div>
                        <div className="field">
                            <label htmlFor="assunto">Assunto</label>
                            <InputText id="assunto" value={formValues.assunto} onChange={(e) => setFormValues((prev) => ({ ...prev, assunto: e.target.value }))} className={classNames({ 'p-invalid': submitted && !formValues.assunto })} />
                            {getFormErrorMessage('assunto')}
                        </div>
                        <div className="field">
                            <label htmlFor="interessado">Interessado</label>
                            <InputText id="interessado" value={formValues.interessado} onChange={(e) => setFormValues((prev) => ({ ...prev, interessado: e.target.value }))} />
                        </div>
                        <div className="field">
                            <label htmlFor="status">Status</label>
                            <Dropdown id="status" value={formValues.status} options={statusOptions} onChange={(e: DropdownChangeEvent) => setFormValues((prev) => ({ ...prev, status: e.value as ProcessoStatus }))} placeholder="Selecione" />
                        </div>
                        <div className="field">
                            <label htmlFor="prioridade">Prioridade</label>
                            <Dropdown id="prioridade" value={formValues.prioridade} options={prioridadeOptions} onChange={(e: DropdownChangeEvent) => setFormValues((prev) => ({ ...prev, prioridade: e.value as ProcessoPrioridade }))} placeholder="Selecione" />
                        </div>
                        <div className="field">
                            <label htmlFor="atualizadoEm">Atualizado em</label>
                            <Calendar
                                id="atualizadoEm"
                                value={formValues.atualizadoEm ? new Date(formValues.atualizadoEm) : null}
                                onChange={(e: CalendarChangeEvent) => {
                                    const date = e.value as Date | null;
                                    setFormValues((prev) => ({ ...prev, atualizadoEm: date ? date.toISOString() : prev.atualizadoEm }));
                                }}
                                dateFormat="dd/mm/yy"
                                mask="99/99/9999"
                                showIcon
                            />
                        </div>
                    </Dialog>

                    <Dialog visible={deleteDialogVisible} style={{ width: '450px' }} header="Confirmar" modal footer={deleteFooter} onHide={hideDeleteDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {editingProcesso && <span>Deseja realmente remover o processo <b>{editingProcesso.numero}</b>?</span>}
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
};

export default ProcessosView;
