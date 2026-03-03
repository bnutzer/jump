import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { t } from '../i18n';

interface DialogOptions {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

interface DialogContextValue {
    confirm: (options: DialogOptions) => Promise<boolean>;
    showAlert: (message: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error('useDialog must be used within DialogProvider');
    }
    return ctx;
}

type DialogState =
    | { open: false }
    | { open: true; mode: 'confirm'; options: DialogOptions }
    | { open: true; mode: 'alert'; message: string };

export function DialogProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<DialogState>({ open: false });
    const resolveRef = useRef<((value: boolean | undefined) => void) | null>(
        null,
    );

    const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            resolveRef.current = (v) => resolve(v as boolean);
            setState({ open: true, mode: 'confirm', options });
        });
    }, []);

    const showAlert = useCallback((message: string): Promise<void> => {
        return new Promise<void>((resolve) => {
            resolveRef.current = () => resolve();
            setState({ open: true, mode: 'alert', message });
        });
    }, []);

    const close = useCallback((value: boolean | undefined) => {
        resolveRef.current?.(value);
        resolveRef.current = null;
        setState({ open: false });
    }, []);

    return (
        <DialogContext.Provider value={{ confirm, showAlert }}>
            {children}
            <ConfirmDialog state={state} onClose={close} />
        </DialogContext.Provider>
    );
}

function ConfirmDialog({
    state,
    onClose,
}: {
    state: DialogState;
    onClose: (value: boolean | undefined) => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) {
            return;
        }
        if (state.open) {
            if (!el.open) {
                el.showModal();
            }
        } else {
            if (el.open) {
                el.close();
            }
        }
    }, [state.open]);

    function handleCancel(e: React.SyntheticEvent) {
        e.preventDefault();
        onClose(state.open && state.mode === 'confirm' ? false : undefined);
    }

    function handleBackdropClick(e: React.MouseEvent) {
        if (e.target === dialogRef.current) {
            onClose(state.open && state.mode === 'confirm' ? false : undefined);
        }
    }

    if (!state.open) {
        return <dialog ref={dialogRef} className="confirm-dialog" />;
    }

    const message =
        state.mode === 'confirm' ? state.options.message : state.message;
    const danger = state.mode === 'confirm' && state.options.danger;

    return (
        <dialog
            ref={dialogRef}
            className="confirm-dialog"
            onCancel={handleCancel}
            onClick={handleBackdropClick}
        >
            <div className="confirm-dialog-content">
                <p className="confirm-dialog-message">{message}</p>
                <div className="confirm-dialog-actions">
                    {state.mode === 'confirm' ? (
                        <>
                            <button
                                className="btn"
                                onClick={() => onClose(false)}
                            >
                                {state.options.cancelLabel ?? t('btnCancel')}
                            </button>
                            <button
                                className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => onClose(true)}
                                autoFocus
                            >
                                {state.options.confirmLabel ??
                                    t('dialogConfirm')}
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => onClose(undefined)}
                            autoFocus
                        >
                            {t('dialogOk')}
                        </button>
                    )}
                </div>
            </div>
        </dialog>
    );
}
