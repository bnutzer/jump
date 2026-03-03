import { useState } from 'react';
import { JumpTarget } from '../data/jumpMap';
import { t } from '../i18n';
import { validateTarget } from '../services/jumpTargetValidation';
import { useDialog } from '../shared/DialogContext';

interface Props {
    targetKey: string;
    target: JumpTarget;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: (target: JumpTarget) => Promise<void>;
    onDelete: () => Promise<void>;
}

export default function JumpTableRow({
    targetKey,
    target,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onSave,
    onDelete,
}: Props) {
    const { confirm } = useDialog();
    const [url, setUrl] = useState(target.url);
    const [description, setDescription] = useState(target.description);
    const [error, setError] = useState<string | null>(null);

    function handleStartEdit() {
        setUrl(target.url);
        setDescription(target.description);
        setError(null);
        onStartEdit();
    }

    async function handleSave() {
        const err = validateTarget(url.trim(), description.trim());
        if (err) {
            setError(err);
            return;
        }
        await onSave({ url: url.trim(), description: description.trim() });
    }

    async function handleDelete() {
        if (
            await confirm({
                message: t('confirmDelete', targetKey),
                danger: true,
            })
        ) {
            await onDelete();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleSave();
        }
        if (e.key === 'Escape') {
            onCancelEdit();
        }
    }

    if (isEditing) {
        return (
            <tr>
                <td>
                    <code>{targetKey}</code>
                </td>
                <td>
                    <input
                        className="input"
                        type="text"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </td>
                <td>
                    <input
                        className="input"
                        type="text"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                </td>
                <td>
                    <div className="action-btns">
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={handleSave}
                        >
                            {t('btnSave')}
                        </button>
                        <button className="btn btn-sm" onClick={onCancelEdit}>
                            {t('btnCancel')}
                        </button>
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td>
                <code>{targetKey}</code>
            </td>
            <td className="col-url">
                <a href={target.url} target="_blank" rel="noreferrer">
                    {target.url}
                </a>
            </td>
            <td>{target.description}</td>
            <td>
                <div className="action-btns">
                    <button className="btn btn-sm" onClick={handleStartEdit}>
                        {t('btnEdit')}
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={handleDelete}
                    >
                        {t('btnDelete')}
                    </button>
                </div>
            </td>
        </tr>
    );
}
