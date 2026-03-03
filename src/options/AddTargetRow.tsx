import { useState } from 'react';
import { validateNewTarget } from '../services/jumpTargetValidation';
import {t} from "../i18n";

interface Props {
    existingKeys: string[];
    onAdd: (
        key: string,
        url: string,
        description: string,
    ) => Promise<string | null>;
}

export default function AddTargetRow({ existingKeys, onAdd }: Props) {
    const [key, setKey] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleAdd() {
        const k = key.trim();
        const u = url.trim();
        const d = description.trim();

        const validationError = validateNewTarget(k, u, d, existingKeys);
        if (validationError) {
            setError(validationError);
            return;
        }

        const result = await onAdd(k, u, d);
        if (result) {
            setError(result);
        } else {
            setKey('');
            setUrl('');
            setDescription('');
            setError(null);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            handleAdd();
        }
    }

    return (
        <tfoot>
            <tr>
                <td>
                    <input
                        className="input"
                        type="text"
                        value={key}
                        onChange={(e) => {
                            setKey(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={t('placeholderKey')}
                    />
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
                        placeholder={t('placeholderUrl')}
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
                        placeholder={t('placeholderDescription')}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={handleAdd}
                    >
                        {t('btnAdd')}
                    </button>
                    {error && <div className="error-msg">{error}</div>}
                </td>
            </tr>
        </tfoot>
    );
}
