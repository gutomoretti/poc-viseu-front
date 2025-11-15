'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Message } from 'primereact/message';
import { useAuth } from '@/hooks/useAuth';

const LoginView = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { layoutConfig } = useContext(LayoutContext);
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', {
        'p-input-filled': layoutConfig.inputStyle === 'filled'
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/processos');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!username || !password) {
            setErrorMessage('Informe usuário e senha.');
            return;
        }
        setSubmitting(true);
        setErrorMessage(null);

        const result = await login({ username, password, conId: 0 });
        if (!result.success) {
            setErrorMessage(result.message ?? 'Credenciais inválidas.');
        } else {
            router.push('/processos');
        }

        setSubmitting(false);
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <form className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }} onSubmit={handleSubmit}>
                        <div className="text-center mb-5">
                            <img src="/demo/images/login/avatar.png" alt="Avatar" height="50" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-1">Bem-vindo!</div>
                            <span className="text-600 font-medium">Entre para acessar a área administrativa.</span>
                        </div>

                        <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                            Usuário ou e-mail
                        </label>
                        <InputText id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                        <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                            Senha
                        </label>
                        <Password inputId="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" toggleMask className="w-full mb-3" inputClassName="w-full p-3 md:w-30rem"></Password>

                        {errorMessage && (
                            <Message severity="error" text={errorMessage} className="mb-4" />
                        )}

                        <div className="flex align-items-center justify-content-between mb-5 gap-5">
                            <div className="flex align-items-center">
                                <Checkbox inputId="remember" checked={remember} onChange={(e) => setRemember(e.checked ?? false)} className="mr-2"></Checkbox>
                                <label htmlFor="remember">Lembrar acesso</label>
                            </div>
                            <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                Esqueceu a senha?
                            </a>
                        </div>

                        <Button type="submit" label="Entrar" className="w-full p-3 text-xl" loading={submitting} disabled={submitting}></Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
