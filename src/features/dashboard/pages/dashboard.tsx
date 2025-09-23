import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/cardSkeleton";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { useAuthStore } from "@/store/auth/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SummaryCounts {
  on_hold?: number;
  closed?: number;
  for_approval?: number;
  on_hold_tr?: number;
  completed_hod_review?: number;
  own_created?: number;
  department_total?: number;
  completed_tr?: number;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.role ?? []; // string[]
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SummaryCounts>({
    queryKey: ["dashboardSummary"],
    queryFn: () => purchaseReportService.getSummary(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5, // cache for 5 min
    gcTime: 1000 * 60 * 30, // garbage collect after 30 min
  });

  useEffect(() => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_REVERB_SCHEME || "ws"}://${
        import.meta.env.VITE_REVERB_HOST
      }:${
        import.meta.env.VITE_REVERB_PORT
      }/app/nnweoeb3x4xpftxvnfau?protocol=7&client=js&version=8.4.0&flash=false`
    );

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // ✅ If backend sends the updated summary
        if (message.type === "summary_update") {
          queryClient.setQueryData(["dashboardSummary"], message.data);
        }

        // ✅ If backend just signals a change
        if (message.type === "summary_changed") {
          queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    return () => ws.close();
  }, [queryClient]);

  return (
    <div className="p-6 -mt-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* On Hold — only admin + hod */}
        {/* Changed name to For Approval */}
        {roles.some((r) => ["admin", "hod"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">For Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.on_hold ?? 0}</div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    PRs For Approval
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* For Approval — only admin + hod */}
        {/* Changed For Approval to For Processing FE Only */}
        {/* {roles.some((r) => ["admin", "hod"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    For Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.for_approval ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Awaiting Processing
                  </p>
                </CardContent>
              </Card>
            </a>
          ))} */}

        {/* On Hold TR — only admin + technical_reviewer + hod */}
        {roles.some((r) =>
          ["admin", "technical_reviewer", "hod"].includes(r)
        ) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    On Hold (TR)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.on_hold_tr ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    TR Hold Requests
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* Completed TR — only admin + technical_reviewer */}
        {roles.some((r) => ["admin", "technical_reviewer"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed TR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.completed_tr ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Finished TR Requests
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* Completed HOD Review — only admin + hod */}
        {roles.some((r) => ["admin", "hod"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed HOD Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.completed_hod_review ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Reviewed by HOD
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* Own Created — only admin + user */}
        {roles.some((r) => ["admin", "user"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Own Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.own_created ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Created by You
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* Department Total — only admin + user */}
        {roles.some((r) => ["admin", "user"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Department Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.department_total ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Total for Department
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* Closed Purchase Order Total — only admin + purchasing */}
        {roles.some((r) => ["admin", "purchasing"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Closed Purchase Order Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.closed ?? 0}</div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Closed Purchase Order Total
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}

        {/* For Purchase Order Creation — only admin + purchasing */}
        {roles.some((r) => ["admin", "purchasing", "hod"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    For Purchase Order Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.for_approval ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Total for Purchase Order Creation
                  </p>
                </CardContent>
              </Card>
            </a>
          ))}
      </div>
    </div>
  );
}
