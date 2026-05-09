export const Content = ({ children, className }) => {
    return (
        <main className={className}>
            <button
                className="layout__refresh"
                onClick={() => window.location.reload()}
                title="Rafraîchir"
            >
                ↻
            </button>
            {children}
        </main>
    )
}