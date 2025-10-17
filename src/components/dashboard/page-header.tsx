import Logo from '@/components/icons/logo';

export default function PageHeader() {
  return (
    <header className="bg-secondary text-secondary-foreground rounded-lg shadow-sm mb-8 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-background/80 p-2 rounded-lg">
            <Logo className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tight text-white">
            AtelierFlow
          </h1>
        </div>
      </div>
    </header>
  );
}
