// File: uni-market/src/app/ui/page.js
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Skeleton } from '../components/Skeleton';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';

export default function UIPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">UI Kit</h2>
      
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Buttons</h3>
        <div className="flex space-x-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Inputs</h3>
        <div className="space-y-2 max-w-md">
          <Input type="text" placeholder="Enter text" />
          <Input type="email" placeholder="Enter email" />
          <Input type="text" placeholder="Disabled input" disabled />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Skeletons</h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Spinner</h3>
        <Spinner />
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Empty State</h3>
        <EmptyState
          title="No Items Found"
          description="It looks like there are no items available in the marketplace yet."
          action={<Button variant="primary">Add Item</Button>}
        />
      </section>
    </div>
  );
}