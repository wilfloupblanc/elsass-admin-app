import { useState, useEffect } from 'react'

import "./UpdateBanner.scss"

export const UpdateBanner = () => {
    const [status, setStatus] = useState(null)

    useEffect(() => {
        window.electronAPI.onUpdateAvailable(() => setStatus('available'))
        window.electronAPI.onUpdateDownloaded(() => setStatus('downloaded'))
    }, [])

    if (!status) return null

    return (
        <div className={`update-banner update-banner--${status}`}>
            {status === 'available' && (
                <span>Téléchargement d'une mise à jour en cours...</span>
            )}
            {status === 'downloaded' && (
                <>
                    <span>Une nouvelle version est prête à être installée.</span>
                    <button onClick={() => window.electronAPI.installUpdate()}>
                        Redémarrer maintenant
                    </button>
                </>
            )}
        </div>
    )
}