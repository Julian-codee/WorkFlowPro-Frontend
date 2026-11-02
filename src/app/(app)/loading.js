import { Card, CardBody, Skeleton } from "@/components/ui";

/**
 * Estado de carga de la zona autenticada.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardBody className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-12" />
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" rounded="rounded-lg" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" rounded="rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
