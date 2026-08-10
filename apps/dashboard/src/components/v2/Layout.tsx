export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <main className="p-4">
                {children}
            </main>
        </div>
    );
}
