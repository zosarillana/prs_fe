import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/cardSkeleton";
import { purchaseReportService } from "@/features/purchasereports/purchaseReportService";
import { useAuthStore } from "@/store/auth/authStore";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  total_prs?: number;
  completed_tr?: number;
  returned?: number;
  rejected?: number;
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const roles = user?.role ?? [];

  // ✅ FIXED: Removed aggressive caching to allow realtime refetches
  const { data, isLoading } = useQuery<SummaryCounts>({
    queryKey: ["dashboardSummary"],
    queryFn: () => purchaseReportService.getSummary(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // ✅ REMOVED: refetchOnMount: false - this was blocking refetches
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    gcTime: 1000 * 60 * 30,
  });

  // ✅ ADDED: Log when data changes to verify refetches are working
  useEffect(() => {
    if (data) {
      console.log("📊 Dashboard data updated:", data);
    }
  }, [data]);

  return (
    <div className="p-6 -mt-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {(() => {
        const canSeeAll = roles.includes("hod") && roles.includes("purchasing");

        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* For HOD Approval */}
            {(canSeeAll ||
              roles.some((r) => ["admin", "hod", "user"].includes(r))) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?prStatusTerm=on_hold"
                  className="block"
                >
                  <Card className="group cursor-pointer transition hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        For HOD Approval
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.on_hold ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                        For HOD Approval
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {/* For TR Approval */}
            {(canSeeAll ||
              roles.some((r) =>
                ["admin", "technical_reviewer", "hod", "user"].includes(r)
              )) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?prStatusTerm=on_hold_tr"
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

            {/* Completed TR */}
            {(canSeeAll ||
              roles.some((r) => ["admin", "technical_reviewer"].includes(r))) &&
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

            {/* Own Created */}
            {!canSeeAll &&
              roles.includes("user") &&
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

            {/* Department Total */}
            {!canSeeAll &&
              roles.some((r) => ["admin", "user", "hod"].includes(r)) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?ownDepartment=true"
                  className="block"
                >
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
                </Link>
              ))}

            {/* Total PRs */}
            {(canSeeAll || roles.includes("admin")) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link to="/purchase-reports" className="block">
                  <Card className="group cursor-pointer transition hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total PR's
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.total_prs ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                        Total for Department PR's
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {/* Closed PRs */}
            {(canSeeAll ||
              roles.some((r) => ["admin", "purchasing"].includes(r))) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?prStatusTerm=closed"
                  className="block"
                >
                  <Card className="group cursor-pointer transition hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Closed PRs Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.closed_pr ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                        Closed PRs Total
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {/* For Purchase Order Creation */}
            {(canSeeAll ||
              roles.some((r) =>
                ["admin", "purchasing", "hod", "user"].includes(r)
              )) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?prStatusTerm=for_approval&forPoApproval=true"
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

            {/* For Approval */}
            {(canSeeAll ||
              roles.some((r) => ["admin", "purchasing"].includes(r))) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?statusTerm=For_approval&forCeoApproval=true"
                  className="block"
                >
                  <Card className="group cursor-pointer transition hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        For Approval
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {data?.for_ceo_approval ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                        Total for Approval
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {/* Approved POs */}
            {(canSeeAll ||
              roles.some((r) => ["admin", "purchasing"].includes(r))) &&
              (isLoading ? (
                <CardSkeleton />
              ) : (
                <Link
                  to="/purchase-reports?statusTerm=approved"
                  className="block"
                >
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

            {/* Returned */}
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <Link
                to="/purchase-reports?prStatusTerm=returned"
                className="block"
              >
                <Card className="group cursor-pointer transition hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Returned PR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data?.returned ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                      Returned PR
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}

            {/* Rejected */}
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <Link
                to="/purchase-reports?prStatusTerm=rejected"
                className="block"
              >
                <Card className="group cursor-pointer transition hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rejected PR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data?.rejected ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground group-hover:underline group-hover:font-bold">
                      Rejected PR
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        );
      })()}

      <Separator className="my-4" />

      {/* Collapsible Section */}
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

            <div className="rounded-md border px-4 py-2 font-mono text-sm">
              Head of department's total signed documents:{" "}
              {data?.completed_hod_review ?? 0}
            </div>

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