import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/cardSkeleton";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { useAuthStore } from "@/store/auth/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // adjust import path
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

interface SummaryCounts {
  on_hold?: number;
  closed?: number;
  closed_pr?: number;
  approved_po?: number;
  for_approval?: number;
  for_ceo_approval?: number;
  on_hold_tr?: number;
  completed_hod_review?: number;
  completed_tr_review?: number;
  own_created?: number;
  department_total?: number;
  completed_tr?: number;
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const roles = user?.role ?? []; // string[]
  const queryClient = useQueryClient();
  const [showOwnReports, setShowOwnReports] = useState(false);
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
        {roles.some((r) => ["admin", "hod", "user"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link to="/purchase-reports?statusTerm=on_hold" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    For HOD Approval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.on_hold ?? 0}</div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    PRs For Head of Department
                  </p>
                </CardContent>
              </Card>
            </Link>
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
          ["admin", "technical_reviewer", "hod", "user"].includes(r)
        ) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link
              to="/purchase-reports?statusTerm=on_hold_tr"
              className="block"
            >
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    For TR Approval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.on_hold_tr ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    For TR Approval
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        {/* On Hold TR — only admin + technical_reviewer + hod */}
        {roles.some((r) => ["admin", "technical_reviewer"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link to="/purchase-reports?completedTr=true" className="block">
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
                    Completed TR
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}

        {/* Own Created — only admin + user */}
        {roles.some((r) => ["user"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link to="/purchase-reports?ownCreated=true" className="block">
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
            </Link>
          ))}

        {/* Department Total — only admin + user */}
        {roles.some((r) => ["admin", "user", "hod"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <a href="/purchase-reports" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Department Total PR's
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.department_total ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Total for Department PR's
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
            <Link to="/purchase-reports?statusTerm=closed" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Closed Prs Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.closed_pr ?? 0}</div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Closed Purchase Prs Total
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}

        {/* For Purchase Order Creation — only admin + purchasing */}
        {roles.some((r) =>
          ["admin", "purchasing", "hod", "technical_reviewer", "user"].includes(
            r
          )
        ) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link
              to="/purchase-reports?statusTerm=for_approval"
              className="block"
            >
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
            </Link>
          ))}

        {roles.some((r) => ["admin", "purchasing"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link
              to="/purchase-reports?forCeoApproval=true"
              className="block"
            >
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    For CEO Approval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.for_ceo_approval ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Total for CEO Creation
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        {roles.some((r) => ["admin", "purchasing"].includes(r)) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <Link to="/purchase-reports?approvedPo=true" className="block">
              <Card className="group cursor-pointer transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Approved Purchase Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data?.approved_po ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                    Total Approved Purchase Orders
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
      <Separator className="my-4" />

      {roles.some((r) => ["admin", "hod"].includes(r)) &&
        (isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground py-4">
            . . .
          </div>
        ) : (
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex w-[440px] flex-col gap-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-4">
              <h4 className="text-sm font-semibold">
                Documents Signed by HOD or Technical Reviewer...
              </h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronsUpDown />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>

            {/* Always visible first item */}
            <div className="rounded-md border px-4 py-2 font-mono text-sm">
              Head of department's total signed documents:{" "}
              {data?.completed_hod_review ?? 0}
            </div>

            {/* Collapsible content */}
            <CollapsibleContent className="flex flex-col gap-2">
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                Technical Reviewer's total signed documents:{" "}
                {data?.completed_tr_review ?? 0}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
    </div>
  );
}
