import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, PackageCheck } from "lucide-react";

type StatsCardsProps = {
    inProcessCount: number;
    awaitingPickupCount: number;
}

export function StatsCards({ inProcessCount, awaitingPickupCount }: StatsCardsProps) {
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Process</CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inProcessCount}</div>
                    <p className="text-xs text-muted-foreground">Orders currently being worked on</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Awaiting Pickup</CardTitle>
                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{awaitingPickupCount}</div>
                    <p className="text-xs text-muted-foreground">Orders ready for customers</p>
                </CardContent>
            </Card>
        </>
    )
}
