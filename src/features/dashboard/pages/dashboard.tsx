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
import {
  ChevronsUpDown,
  Clock,
  CheckCircle2,
  FileText,
  Building2,
  FileClock,
  FileEdit,
  ShoppingCart,
  XCircle,
  RotateCcw,
  TrendingUp,
  ClipboardList,
  Package,
} from "lucide-react";
import { SummaryCounts } from "../types";

// Card data configuration with icons and colors
const getCardConfig = (key: string) => {
  const configs: Record<
    string,
    { icon: any; gradient: string; accentColor: string }
  > = {
    on_hold: {
      icon: Clock,
      gradient: "from-amber-500/10 to-orange-500/10",
      accentColor: "text-amber-600",
    },
    on_hold_tr: {
      icon: FileText,
      gradient: "from-blue-500/10 to-cyan-500/10",
      accentColor: "text-blue-600",
    },
    completed_tr: {
      icon: CheckCircle2,
      gradient: "from-green-500/10 to-emerald-500/10",
      accentColor: "text-green-600",
    },
    own_created: {
      icon: FileEdit,
      gradient: "from-purple-500/10 to-pink-500/10",
      accentColor: "text-purple-600",
    },
    department_total: {
      icon: Building2,
      gradient: "from-indigo-500/10 to-blue-500/10",
      accentColor: "text-indigo-600",
    },
    on_hold_return: {
      icon: FileClock,
      gradient: "from-yellow-500/10 to-amber-500/10",
      accentColor: "text-yellow-600",
    },
    drafted: {
      icon: FileEdit,
      gradient: "from-slate-500/10 to-gray-500/10",
      accentColor: "text-slate-600",
    },
    total_prs: {
      icon: ClipboardList,
      gradient: "from-violet-500/10 to-purple-500/10",
      accentColor: "text-violet-600",
    },
    closed_pr: {
      icon: XCircle,
      gradient: "from-red-500/10 to-rose-500/10",
      accentColor: "text-red-600",
    },
    for_approval: {
      icon: ShoppingCart,
      gradient: "from-teal-500/10 to-cyan-500/10",
      accentColor: "text-teal-600",
    },
    partial_po: {
      icon: Package,
      gradient: "from-orange-500/10 to-amber-500/10",
      accentColor: "text-orange-600",
    },
    for_ceo_approval: {
      icon: TrendingUp,
      gradient: "from-pink-500/10 to-rose-500/10",
      accentColor: "text-pink-600",
    },
    approved_po: {
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 to-green-500/10",
      accentColor: "text-emerald-600",
    },
    returned: {
      icon: RotateCcw,
      gradient: "from-yellow-500/10 to-orange-500/10",
      accentColor: "text-yellow-700",
    },
    rejected: {
      icon: XCircle,
      gradient: "from-red-500/10 to-pink-500/10",
      accentColor: "text-red-600",
    },
  };

  return (
    configs[key] || {
      icon: FileText,
      gradient: "from-gray-500/10 to-slate-500/10",
      accentColor: "text-gray-600",
    }
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  description: string;
  link: string;
  configKey: string;
}

const StatCard = ({
  title,
  value,
  description,
  link,
  configKey,
}: StatCardProps) => {
  const config = getCardConfig(configKey);
  const Icon = config.icon;

  return (
    <Link to={link} className="block group">
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-green-500 bg-gradient-to-br ${config.gradient} dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
            {title}
          </CardTitle>
          <div
            className={`p-2 rounded-lg bg-white/80 dark:bg-gray-700/80 shadow-sm transition-colors ${config.accentColor} dark:text-gray-300 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold mb-1 transition-colors ${config.accentColor} dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400`}
          >
            {value.toLocaleString()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const roles = user?.role ?? [];

  const { data, isLoading } = useQuery<SummaryCounts>({
    queryKey: ["dashboardSummary"],
    queryFn: () => purchaseReportService.getSummary(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (data) {
      console.log("📊 Dashboard data updated:", data);
    }
  }, [data]);

  const canSeeAll = roles.includes("hod") && roles.includes("purchasing");

  return (
    <div className="p-6 -mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's an overview of your purchase reports
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* For HOD Approval */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "hod", "user"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="For HOD Approval"
              value={data?.on_hold ?? 0}
              description="Pending HOD review"
              link="/purchase-reports?prStatusTerm=on_hold"
              configKey="on_hold"
            />
          ))}

        {/* For TR Approval */}
        {(canSeeAll ||
          roles.some((r) =>
            ["admin", "technical_reviewer", "hod", "user"].includes(r),
          )) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="For TR Approval"
              value={data?.on_hold_tr ?? 0}
              description="Pending technical review"
              link="/purchase-reports?prStatusTerm=on_hold_tr"
              configKey="on_hold_tr"
            />
          ))}

        {/* Completed TR */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "technical_reviewer"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Completed TR"
              value={data?.completed_tr ?? 0}
              description="Technical reviews completed"
              link="/purchase-reports?completedTr=true"
              configKey="completed_tr"
            />
          ))}

        {/* Own Created */}
        {!canSeeAll &&
          roles.includes("user") &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Own Created"
              value={data?.own_created ?? 0}
              description="Created by you"
              link="/purchase-reports?ownCreated=true"
              configKey="own_created"
            />
          ))}

        {/* Department Total */}
        {!canSeeAll &&
          roles.some((r) =>
            ["admin", "user", "hod", "ovs", "treasury"].includes(r),
          ) && (
            <>
              {isLoading ? (
                <CardSkeleton />
              ) : (
                <StatCard
                  title="Department Total PRs"
                  value={data?.department_total ?? 0}
                  description="Total departmental reports"
                  link="/purchase-reports?ownDepartment=true"
                  configKey="department_total"
                />
              )}

              {/* On Hold For Edit & Drafted */}
              {!roles.some((r) => ["treasury"].includes(r)) && (
                <>
                  {isLoading ? (
                    <CardSkeleton />
                  ) : (
                    <StatCard
                      title="On Hold For Edit"
                      value={data?.on_hold_return ?? 0}
                      description="Returned for modifications"
                      link="/purchase-reports?prStatusTerm=on_hold_return"
                      configKey="on_hold_return"
                    />
                  )}

                  {isLoading ? (
                    <CardSkeleton />
                  ) : (
                    <StatCard
                      title="Drafted"
                      value={data?.drafted ?? 0}
                      description="Draft purchase reports"
                      link="/purchase-reports?prStatusTerm=drafted"
                      configKey="drafted"
                    />
                  )}
                </>
              )}
            </>
          )}

        {/* Total PRs */}
        {(canSeeAll || roles.includes("admin")) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Total PRs"
              value={data?.total_prs ?? 0}
              description="All purchase reports"
              link="/purchase-reports"
              configKey="total_prs"
            />
          ))}

        {/* Closed PRs */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "purchasing"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Closed PRs Total"
              value={data?.closed_pr ?? 0}
              description="Completed & closed"
              link="/purchase-reports?prStatusTerm=closed"
              configKey="closed_pr"
            />
          ))}

        {/* For Purchase Order Creation */}
        {(canSeeAll ||
          roles.some((r) =>
            ["admin", "purchasing", "hod", "user", "treasury"].includes(r),
          )) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="For Purchase Order Creation"
              value={data?.for_approval ?? 0}
              description="Ready for PO creation"
              link="/purchase-reports?prStatusTerm=for_approval&forPoApproval=true"
              configKey="for_approval"
            />
          ))}

        {/* For Partial Purchase Order Creation */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "purchasing", "treasury"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="For Partial PO Creation"
              value={data?.partial_po ?? 0}
              description="Partial orders pending"
              link="/purchase-reports?statusTerm=partial_po"
              configKey="partial_po"
            />
          ))}

        {/* For Approval */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "purchasing"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="For Approval"
              value={data?.for_ceo_approval ?? 0}
              description="Awaiting final approval"
              link="/purchase-reports?statusTerm=For_approval&forCeoApproval=true"
              configKey="for_ceo_approval"
            />
          ))}

        {/* Approved POs */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "purchasing", "treasury"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Approved Purchase Orders"
              value={data?.approved_po ?? 0}
              description="Orders approved & ready"
              link="/purchase-reports?statusTerm=approved"
              configKey="approved_po"
            />
          ))}

        {/* Approved POs */}
        {(canSeeAll ||
          roles.some((r) => ["admin", "purchasing", "hod", "treasury"].includes(r))) &&
          (isLoading ? (
            <CardSkeleton />
          ) : (
            <StatCard
              title="Total Vendor Payment"
              value={data?.total_vendor_payments ?? 0}
              description="Total of Vendor Payments"
              link="/vendor-payments"
              configKey="vendor_payments"
            />
          ))}

        {/* Returned & Rejected */}
        {!roles.some((r) => ["treasury"].includes(r)) && (
          <>
            {/* Returned */}
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <StatCard
                title="Returned PR"
                value={data?.returned ?? 0}
                description="Returned for revision"
                link="/purchase-reports?prStatusTerm=returned"
                configKey="returned"
              />
            )}

            {/* Rejected */}
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <StatCard
                title="Rejected PR"
                value={data?.rejected ?? 0}
                description="Rejected reports"
                link="/purchase-reports?prStatusTerm=Rejected"
                configKey="rejected"
              />
            )}
          </>
        )}
      </div>

      <Separator className="my-6" />

      {/* Collapsible Section */}
      {roles.some((r) => ["admin", "hod"].includes(r)) &&
        (isLoading ? (
          <div className="text-2xl font-bold text-muted-foreground py-4 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
              <div
                className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        ) : (
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full max-w-2xl"
          >
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 transition-colors duration-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Review Statistics
                  </h4>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <ChevronsUpDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>

              <div className="mt-4 rounded-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    HOD Signed Documents
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data?.completed_hod_review ?? 0}
                  </span>
                </div>
              </div>

              <CollapsibleContent className="overflow-hidden transition-all duration-500 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <div className="mt-3 rounded-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 px-4 py-3 transition-all duration-300 hover:shadow-md animate-in fade-in-0 slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Technical Reviewer Signed Documents
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {data?.completed_tr_review ?? 0}
                    </span>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
    </div>
  );
}
