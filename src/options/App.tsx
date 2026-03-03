import { useRef, useState } from 'react';
import { t } from '../i18n';
import { useEditableJumpMap } from '../hooks/useEditableJumpMap';
import { downloadJumpMapAsJson } from '../services/jumpMapExport';
import { parseAndValidateJumpMap } from '../services/jumpMapImport';
import { useDialog } from '../shared/DialogContext';
import { useToast } from '../shared/ToastContext';
import { useTheme } from '../shared/useTheme';
import ThemeToggle from '../shared/ThemeToggle';
import JumpTableRow from './JumpTableRow';
import AddTargetRow from './AddTargetRow';

export default function App() {
    const {
        targets,
        map,
        loading,
        addTarget,
        updateTarget,
        deleteTarget,
        resetToDefaults,
        importMap,
    } = useEditableJumpMap();
    const { confirm, showAlert } = useDialog();
    const { showToast } = useToast();
    const { theme, setTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingKey, setEditingKey] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="options">
                <p>{t('loading')}</p>
            </div>
        );
    }

    async function handleAdd(
        key: string,
        url: string,
        description: string,
    ): Promise<string | null> {
        const result = await addTarget(key, { url, description });
        if (!result.ok) {
            return result.reason;
        }
        showToast(t('toastTargetAdded'), 'success');
        return null;
    }

    async function handleReset() {
        if (await confirm({ message: t('confirmReset'), danger: true })) {
            const result = await resetToDefaults();
            if (result.ok) {
                showToast(t('toastResetSuccess'), 'success');
            } else {
                showToast(result.reason, 'error');
            }
            setEditingKey(null);
        }
    }

    function handleExport() {
        if (!map) {
            return;
        }
        try {
            downloadJumpMapAsJson(map);
            showToast(t('toastExportSuccess'), 'success');
        } catch {
            showToast(t('toastSaveFailed'), 'error');
        }
    }

    function handleImportClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            const result = parseAndValidateJumpMap(reader.result as string);
            if (!result.ok) {
                if (result.error === 'invalidJson') {
                    await showAlert(t('alertInvalidJson'));
                } else if (result.failureKey) {
                    await showAlert(t('alertInvalidTarget', result.failureKey));
                } else {
                    await showAlert(t('alertInvalidJsonObject'));
                }
                return;
            }
            if (!(await confirm({ message: t('confirmImport') }))) {
                return;
            }
            const importResult = await importMap(result.map);
            if (importResult.ok) {
                showToast(t('toastImportSuccess'), 'success');
            } else {
                showToast(importResult.reason, 'error');
            }
            setEditingKey(null);
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    return (
        <div className="options">
            <header className="options-header">
                <h1>{t('optionsHeading')}</h1>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </header>

            <table className="jump-table">
                <thead>
                    <tr>
                        <th className="col-key">{t('colKey')}</th>
                        <th className="col-url">{t('colUrl')}</th>
                        <th className="col-desc">{t('colDescription')}</th>
                        <th className="col-actions">{t('colActions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {targets.map(({ key, url, description }) => (
                        <JumpTableRow
                            key={key}
                            targetKey={key}
                            target={{ url, description }}
                            isEditing={editingKey === key}
                            onStartEdit={() => setEditingKey(key)}
                            onCancelEdit={() => setEditingKey(null)}
                            onSave={async (target) => {
                                const result = await updateTarget(key, target);
                                if (result.ok) {
                                    showToast(
                                        t('toastTargetUpdated'),
                                        'success',
                                    );
                                    setEditingKey(null);
                                } else {
                                    showToast(result.reason, 'error');
                                }
                            }}
                            onDelete={async () => {
                                const result = await deleteTarget(key);
                                if (result.ok) {
                                    showToast(
                                        t('toastTargetDeleted'),
                                        'success',
                                    );
                                    setEditingKey(null);
                                } else {
                                    showToast(result.reason, 'error');
                                }
                            }}
                        />
                    ))}
                </tbody>
                <AddTargetRow existingKeys={targets.map(t => t.key)} onAdd={handleAdd} />
            </table>

            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <div className="options-toolbar">
                <button className="btn" onClick={handleExport}>
                    {t('btnExport')}
                </button>
                <button className="btn" onClick={handleImportClick}>
                    {t('btnImport')}
                </button>
                <button className="btn btn-danger" onClick={handleReset}>
                    {t('btnResetDefaults')}
                </button>
            </div>
        </div>
    );
}
